"use client";

import { useRouter } from 'next/navigation';

export default function Edit() {
    const router = useRouter();

    const handleEdit = (cropId) => {
        router.push(`/crops/addnewcrop?id=${cropId}`);
    };

    return (
        <button
            onClick={() => { handleEdit(crop.id) }}
            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
        >
            Edit
        </button>
    );
}
