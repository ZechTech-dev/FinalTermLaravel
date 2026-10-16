<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index()
    {
        $today = now('Asia/Manila')->toDateString();
        return Inertia::render('Attendance/Index', [
            'today' => auth()->user()->attendances()->whereDate('date', $today)->first(),
            'history' => auth()->user()->attendances()->latest('date')->paginate(15),
        ]);
    }

    public function timeIn()
    {
        $now = now('Asia/Manila');
        abort_if($now->format('H:i:s') < '07:00:00', 422, 'Time in opens at 7:00 AM.');

        $status = $now->format('H:i:s') > '08:00:00' ? 'Late' : 'Present';
        $late = $status === 'Late' ? (int) $now->diffInMinutes($now->copy()->setTime(8, 0)) : 0;

        Attendance::firstOrCreate(
            ['user_id' => auth()->id(), 'date' => $now->toDateString()],
            ['time_in' => $now->format('H:i:s'), 'status' => $status, 'late_minutes' => $late]
        );

        return back();
    }

    public function breakIn()
    {
        $row = $this->todayRow();
        abort_if(!$row->time_in || $row->break_in || $row->time_out, 422, 'Break in is not available.');
        $row->update(['break_in' => now('Asia/Manila')->format('H:i:s')]);
        return back();
    }

    public function breakOut()
    {
        $row = $this->todayRow();
        abort_if(!$row->break_in || $row->break_out || $row->time_out, 422, 'Break out is not available.');
        $row->update(['break_out' => now('Asia/Manila')->format('H:i:s')]);
        return back();
    }

    public function timeOut()
    {
        $row = $this->todayRow();
        abort_if(!$row->time_in || $row->time_out, 422, 'Time out is not available.');
        abort_if($row->break_in && !$row->break_out, 422, 'End your break before timing out.');

        $now = now('Asia/Manila');
        $breakHours = 0;
        if ($row->break_in && $row->break_out) {
            $breakHours = Carbon::parse($row->break_in)->diffInMinutes(Carbon::parse($row->break_out)) / 60;
        }
        $worked = Carbon::parse($row->time_in)->diffInMinutes($now) / 60 - $breakHours;
        $row->update([
            'time_out' => $now->format('H:i:s'),
            'break_hours' => round($breakHours, 2),
            'total_hours' => round(max(0, $worked), 2),
            'overtime_hours' => round(max(0, $worked - 8), 2),
        ]);
        return back();
    }

    private function todayRow(): Attendance
    {
        return auth()->user()->attendances()->whereDate('date', now('Asia/Manila')->toDateString())->firstOrFail();
    }
}
