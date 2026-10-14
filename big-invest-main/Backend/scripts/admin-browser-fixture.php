<?php

// Browser QA fixture only. Credentials arrive over stdin and are never printed or stored in source.
use App\Models\CmsEntry;
use App\Models\CmsMedia;
use App\Models\Enquiry;
use App\Models\NewsletterSubscription;
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
$input = json_decode(stream_get_contents(STDIN), true);
if (! is_array($input) || ! preg_match('/^admin-qa-[a-f0-9]{16}@example\.com$/', $input['email'] ?? '') || DB::connection()->getDatabaseName() !== 'big_invest_db') {
    exit(1);
}
try {
    if (($input['action'] ?? '') === 'create') {
        if (strlen($input['password'] ?? '') < 20) {
            exit(1);
        }
        $user = new User(['name' => 'Browser QA Admin', 'email' => $input['email'], 'password' => $input['password']]);
        $user->is_admin = true;
        $user->save();
        Enquiry::create(['name' => 'QA Browser Enquiry', 'email' => $input['email'], 'company' => 'QA verification only', 'type' => 'partnership', 'message' => 'A temporary enquiry for isolated browser verification.', 'consented_at' => now()]);
        NewsletterSubscription::create(['email' => $input['email'], 'consented_at' => now()]);
        echo 'Temporary QA administrator created.';
    } elseif (($input['action'] ?? '') === 'clean-records') {
        Enquiry::where('email', $input['email'])->delete();
        NewsletterSubscription::where('email', $input['email'])->delete();
        echo 'QA submissions removed.';
    } elseif (($input['action'] ?? '') === 'metrics') {
        echo json_encode(['total_enquiries' => Enquiry::count(), 'new_enquiries' => Enquiry::where('status', 'new')->count(), 'newsletter_subscribers' => NewsletterSubscription::count()]);
    } elseif (($input['action'] ?? '') === 'cleanup') {
        $prefix = 'cms-qa-'.substr($input['email'], 9, 16).'-';
        $entries = CmsEntry::where('slug', 'like', $prefix.'%')->orderByRaw("case when kind = 'categories' then 1 else 0 end")->get();
        foreach ($entries as $entry) {
            $entry->delete();
        }
        foreach (CmsMedia::where('name', 'like', $prefix.'%')->get() as $media) {
            if (! CmsEntry::where('media_id', $media->id)->exists() && ! DB::table('cms_entry_media')->where('cms_media_id', $media->id)->exists()) {
                $path = $media->getRawOriginal('path');
                $media->delete();
                Storage::disk('public')->delete($path);
            }
        }
        Enquiry::where('email', $input['email'])->delete();
        NewsletterSubscription::where('email', $input['email'])->delete();
        $user = User::where('email', $input['email'])->first();
        if ($user) {
            DB::table('sessions')->where('user_id', $user->id)->delete();
            $user->delete();
        }
        echo 'Temporary QA administrator removed.';
    }
} catch (Throwable $error) {
    fwrite(STDERR, 'QA fixture operation failed.');
    exit(1);
}
