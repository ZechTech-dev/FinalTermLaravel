<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    private const TZ = 'Asia/Manila';

    public function index()
    {
        $today = now(self::TZ)->toDateString();

        return Inertia::render('Attendance/Index', [
            'today' => auth()->user()->attendances()->whereDate('date', $today)->first(),
            'history' => auth()->user()->attendances()->latest('date')->paginate(15),
            'summary' => [
                'days' => auth()->user()->attendances()->count(),
                'present' => auth()->user()->attendances()->where('status', 'Present')->count(),
                'late' => auth()->user()->attendances()->where('status', 'Late')->count(),
                'hours' => (float) auth()->user()->attendances()->sum('total_hours'),
            ],
        ]);
    }

    public function timeIn()
    {
        $now = now(self::TZ);

        if ($now->format('H:i:s') < '07:00:00') {
            return back()->with('error', 'Time in opens at 7:00 AM.');
        }

        $start = $now->copy()->setTime(8, 0, 0);
        $isLate = $now->greaterThan($start);
        $late = $isLate ? (int) $start->diffInMinutes($now, true) : 0;

        Attendance::firstOrCreate(
            ['user_id' => auth()->id(), 'date' => $now->toDateString()],
            [
                'time_in' => $now->format('H:i:s'),
                'status' => $isLate ? 'Late' : 'Present',
                'late_minutes' => $late,
            ]
        );

        return back()->with('success', 'Timed in successfully.');
    }

    public function breakIn()
    {
        $row = $this->todayRow();

        if (!$row || !$row->time_in || $row->break_in || $row->time_out) {
            return back()->with('error', 'Break in is not available.');
        }

        $row->update(['break_in' => now(self::TZ)->format('H:i:s')]);

        return back()->with('success', 'Break started.');
    }

    public function breakOut()
    {
        $row = $this->todayRow();

        if (!$row || !$row->break_in || $row->break_out || $row->time_out) {
            return back()->with('error', 'Break out is not available.');
        }

        $row->update(['break_out' => now(self::TZ)->format('H:i:s')]);

        return back()->with('success', 'Break ended.');
    }

    public function timeOut()
    {
        $row = $this->todayRow();

        if (!$row || !$row->time_in || $row->time_out) {
            return back()->with('error', 'Time out is not available.');
        }

        if ($row->break_in && !$row->break_out) {
            return back()->with('error', 'End your break before timing out.');
        }

        $now = now(self::TZ);
        $date = $row->date->format('Y-m-d');
        $at = fn ($time) => Carbon::parse("{$date} {$time}", self::TZ);

        $breakHours = 0;
        if ($row->break_in && $row->break_out) {
            $breakHours = max(0, $at($row->break_in)->diffInMinutes($at($row->break_out), true)) / 60;
        }

        $worked = max(0, $at($row->time_in)->diffInMinutes($now, true) / 60 - $breakHours);

        $row->update([
            'time_out' => $now->format('H:i:s'),
            'break_hours' => round($breakHours, 2),
            'total_hours' => round($worked, 2),
            'overtime_hours' => round(max(0, $worked - 8), 2),
        ]);

        return back()->with('success', 'Timed out successfully.');
    }

    private function todayRow(): ?Attendance
    {
        return auth()->user()->attendances()
            ->whereDate('date', now(self::TZ)->toDateString())
            ->first();
    }
}
