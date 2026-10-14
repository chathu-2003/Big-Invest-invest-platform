<?php

namespace App\Console\Commands;

use App\Models\CmsEntry;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportWebsiteContent extends Command
{
    protected $signature = 'cms:import {--only= : Import one existing content kind} {--fill-navigation : Add missing original navigation descriptions without replacing content}';

    protected $description = 'Insert the audited original website content without overwriting existing CMS records';

    public function handle(): int
    {
        $rows = json_decode(file_get_contents(database_path('seeders/content/initial-content.json')), true, 512, JSON_THROW_ON_ERROR);
        $inserted = 0;
        DB::transaction(function () use ($rows, &$inserted) {
            foreach ($rows as $row) {
                if ($this->option('only') && $row['kind'] !== $this->option('only')) {
                    continue;
                }
                $existing = CmsEntry::where('kind', $row['kind'])->where('slug', $row['slug'])->first();
                if ($existing) {
                    if ($this->option('fill-navigation') && $row['kind'] === 'services' && ! isset($existing->payload['nav_description'])) {
                        $existing->update(['payload' => $existing->payload + ['nav_description' => $row['payload']['nav_description']]]);
                    }

                    continue;
                }
                $category = $row['category_slug'] ?? null;
                unset($row['category_slug']);
                if ($category) {
                    $row['category_id'] = CmsEntry::where('kind', 'categories')->where('slug', $category)->value('id');
                    if (! $row['category_id']) {
                        throw new \RuntimeException('Import categories before articles.');
                    }
                }
                CmsEntry::create($row);
                $inserted++;
            }
        });
        $this->info('Inserted '.$inserted.' existing website records. Existing records were left unchanged.');

        return self::SUCCESS;
    }
}
