<?php

namespace App\Http\Controllers;

use App\Models\FamilyMember;
use Illuminate\Http\Request;

class FamilyMemberController extends Controller
{
   public function index()
{
    $members = \App\Models\FamilyMember::all();
    return view('family.index', compact('members'));
}

    public function create()
    {
        return view('family.create');
    }

    public function store(Request $request)
    {
        FamilyMember::create($request->all());
        return redirect()->route('family.index');
    }

    public function edit($id)
    {
        $member = FamilyMember::findOrFail($id);
        return view('family.edit', compact('member'));
    }

    public function update(Request $request, $id)
    {
        $member = FamilyMember::findOrFail($id);
        $member->update($request->all());
        return redirect()->route('family.index');
    }

    public function destroy($id)
    {
        FamilyMember::destroy($id);
        return back();
    }
}