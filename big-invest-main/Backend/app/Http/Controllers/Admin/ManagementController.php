<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminFilterRequest;
use App\Models\Enquiry;
use App\Models\NewsletterSubscription;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ManagementController extends Controller
{
    private function query(AdminFilterRequest $request, bool $subscribers = false)
    {
        $query = $subscribers ? NewsletterSubscription::query() : Enquiry::query();
        $values = $request->validated();
        if (! empty($values['from'])) {
            $query->whereDate('created_at', '>=', $values['from']);
        }
        if (! empty($values['to'])) {
            $query->whereDate('created_at', '<=', $values['to']);
        }
        if (! empty($values['q'])) {
            $term = '%'.addcslashes($values['q'], '%_\\').'%';
            $query->where(function ($search) use ($subscribers, $term) {
                $search->where('email', 'like', $term);
                if (! $subscribers) {
                    $search->orWhere('name', 'like', $term)->orWhere('company', 'like', $term)->orWhere('message', 'like', $term);
                }
            });
        }
        if (! $subscribers) {
            if ($request->boolean('attention')) {
                $query->whereIn('status', ['new', 'in_progress']);
            }
            if (! empty($values['status'])) {
                $query->where('status', $values['status']);
            }
            if (! empty($values['type'])) {
                $query->where('type', $values['type']);
            }
        }

        return $query;
    }

    private function json($data)
    {
        return response()->json(['success' => true, 'data' => $data])->header('Cache-Control', 'no-store');
    }

    public function enquiries(AdminFilterRequest $request)
    {
        return $this->json($this->query($request)->latest('id')->paginate($request->integer('per_page', 10)));
    }

    public function subscribers(AdminFilterRequest $request)
    {
        return $this->json($this->query($request, true)->latest('id')->paginate($request->integer('per_page', 10)));
    }

    public function show(Enquiry $enquiry)
    {
        return $this->json($enquiry);
    }

    public function update(Request $request, Enquiry $enquiry)
    {
        $values = $request->validate(['status' => ['required', Rule::in(['new', 'in_progress', 'resolved', 'closed'])]]);
        $enquiry->status = $values['status'];
        $enquiry->save();

        return $this->json($enquiry);
    }

    public function dashboard(AdminFilterRequest $request)
    {
        $enquiries = $this->query($request);
        $subscribers = $this->query($request, true);
        $statuses = (clone $enquiries)->selectRaw('status, COUNT(*) AS count')->groupBy('status')->pluck('count', 'status');
        $types = (clone $enquiries)->selectRaw('type, COUNT(*) AS count')->groupBy('type')->pluck('count', 'type');
        $recentEnquiries = (clone $enquiries)->latest('id')->limit(6)->get()->map(fn ($row) => ['id' => 'enquiry-'.$row->id, 'kind' => 'enquiry', 'label' => $row->name.' submitted an enquiry', 'detail' => $row->company, 'created_at' => $row->created_at]);
        $recentSubscribers = (clone $subscribers)->latest('id')->limit(6)->get()->map(fn ($row) => ['id' => 'subscriber-'.$row->id, 'kind' => 'subscriber', 'label' => 'Newsletter subscription received', 'detail' => $row->email, 'created_at' => $row->created_at]);

        return $this->json([
            'total_enquiries' => (clone $enquiries)->count(), 'new_enquiries' => (int) ($statuses['new'] ?? 0),
            'newsletter_subscribers' => (clone $subscribers)->count(), 'by_status' => $statuses, 'by_type' => $types,
            'recent_activity' => $recentEnquiries->concat($recentSubscribers)->sortByDesc('created_at')->take(6)->values(),
            'work_queue' => (clone $enquiries)->whereIn('status', ['new', 'in_progress'])->orderByDesc('updated_at')->limit(5)->get(),
            'recently_updated' => (clone $enquiries)->whereColumn('updated_at', '>', 'created_at')->orderByDesc('updated_at')->limit(5)->get(),
            'subscriber_growth' => (clone $subscribers)->selectRaw('DATE(created_at) AS date, COUNT(*) AS count')->groupByRaw('DATE(created_at)')->orderBy('date')->get(),
        ]);
    }

    private function csv($query, array $columns, string $filename)
    {
        return response()->streamDownload(function () use ($query, $columns) {
            $stream = fopen('php://output', 'w');
            fputcsv($stream, $columns, ',', '"', '');
            foreach ($query->orderBy('id')->cursor() as $row) {
                $values = array_map(function ($column) use ($row) {
                    $value = (string) ($row->$column ?? '');

                    return preg_match('/^[\s]*[=+@-]/', $value) ? "'".$value : $value;
                }, $columns);
                fputcsv($stream, $values, ',', '"', '');
            }
            fclose($stream);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8', 'Cache-Control' => 'no-store']);
    }

    public function exportSubscribers(AdminFilterRequest $request)
    {
        return $this->csv($this->query($request, true), ['id', 'email', 'consented_at', 'created_at'], 'big-invest-subscribers.csv');
    }

    public function exportEnquiries(AdminFilterRequest $request)
    {
        return $this->csv($this->query($request), ['id', 'name', 'email', 'company', 'type', 'status', 'created_at'], 'big-invest-enquiries.csv');
    }
}
