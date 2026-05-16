<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class PageController extends Controller
{
    public function budget()
    {
        return Inertia::render('Budget');
    }

    public function goals()
    {
        return Inertia::render('Goals');
    }

    public function bills()
    {
        return Inertia::render('Bills');
    }

    public function netWorth()
    {
        return Inertia::render('NetWorth');
    }

    public function exportIndex()
    {
        return Inertia::render('Export');
    }

    public function categories()
    {
        return Inertia::render('Categories');
    }
}
