<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use Illuminate\Database\Seeder;

class DocumentTypeSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['Personal Identification', 'Personal'],
            ['Employment Records', 'Employment'],
            ['Training and Certificates', 'Training'],
        ] as [$name, $category]) {
            DocumentType::firstOrCreate(['document_type_name' => $name], ['category' => $category]);
        }
    }
}
