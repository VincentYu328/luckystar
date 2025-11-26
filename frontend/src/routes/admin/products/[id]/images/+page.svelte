<script>
    import { enhance } from '$app/forms';
    export let data;

    const product = data.product;
    const images = data.images;

    let uploading = false;
    let uploadError = null;

    async function handleUpload(e) {
        uploadError = null;
        uploading = true;

        const file = e.target.files?.[0];
        if (!file) {
            uploading = false;
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`/api/product-images/${product.id}/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (!data.success) {
                uploadError = data.error || 'Upload failed.';
            } else {
                location.reload();
            }
        } catch (err) {
            uploadError = err.message;
        }

        uploading = false;
    }

    async function setPrimary(id) {
        await fetch(`/api/products/${product.id}/images/set-primary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_id: id })
        });

        location.reload();
    }

    async function deleteImage(id) {
        if (!confirm('Delete this image?（确定要删除此图片吗？）')) return;

        await fetch(`/api/products/${product.id}/images/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_id: id })
        });

        location.reload();
    }
</script>

<div class="space-y-8">

    <h1 class="text-2xl font-semibold">
        Product Images（产品图片） — {product.name}
    </h1>

    <!-- ================================= -->
    <!-- Upload New Image 上传新图片        -->
    <!-- ================================= -->
    <div class="border rounded-lg p-4 bg-gray-50 space-y-3">

        <h2 class="text-lg font-medium">
            Upload New Image（上传新图片）
        </h2>

        <input
            type="file"
            accept="image/*"
            on:change={handleUpload}
            class="block w-full text-sm text-gray-700"
        />

        {#if uploading}
            <div class="text-blue-600 text-sm">
                Uploading…（上传中…）
            </div>
        {/if}

        {#if uploadError}
            <div class="text-red-600 text-sm">
                {uploadError}
            </div>
        {/if}
    </div>

    <!-- ================================= -->
    <!-- Images Grid 图片列表               -->
    <!-- ================================= -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {#each images as img}
            <div class="border rounded-lg p-2 bg-white space-y-2">

                <!-- Thumbnail -->
                <div class="w-full h-40 overflow-hidden rounded">
                    <img src={img.url} alt={product.name} class="w-full h-full object-cover" />
                </div>

                <!-- Primary Tag -->
                {#if img.is_primary}
                    <div class="text-green-700 font-semibold text-sm">
                        ⭐ Primary Image（主图）
                    </div>
                {/if}

                <!-- Buttons -->
                <div class="flex gap-2 text-sm">

                    {#if !img.is_primary}
                        <button
                            class="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            on:click={() => setPrimary(img.id)}
                        >
                            Set Primary（设为主图）
                        </button>
                    {/if}

                    <button
                        class="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        on:click={() => deleteImage(img.id)}
                    >
                        Delete（删除）
                    </button>

                </div>

            </div>
        {/each}
    </div>

</div>
