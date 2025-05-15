// utils/api.ts
const url = `http://127.0.0.1:8000`

export async function fetchCrops(tag?: string) {
    const query = tag ? `?tag=${tag}` : '';
    const res = await fetch(url + "/api/crops/list" + query);
    if (!res.ok) throw new Error('Failed to fetch crops');
    return res.json();
}

export async function fetchCropById(cropId: string) {
    const res = await fetch(url + "/" + cropId);
    if (!res.ok) throw new Error('Crop not found');
    return res.json();
}

export async function predictYield(cropId: string) {
    const res = await fetch(url + `/api/model/predict`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ crop_id: cropId }),
    });

    if (!res.ok) throw new Error('Prediction failed');
    return res.json();
}
