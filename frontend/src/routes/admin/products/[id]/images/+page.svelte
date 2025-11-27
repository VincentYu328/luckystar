<script>
    import { enhance } from "$app/forms";
    export let data;
    export let form;

    $: product = data.product;
    $: images = data.images;

    // 显示表单提交结果
    $: uploadError = form?.error;
    $: uploadSuccess = form?.success;

    let uploading = false;
    
    // ⭐ 辅助函数：生成完整图片 URL（指向后端）
    function getImageUrl(url) {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `http://localhost:3000${url}`;
    }
</script>

<div class="space-y-8">
    <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">
            Product Images（产品图片） — {product.name}
        </h1>
        <a
            href="/admin/products/{product.id}/edit"
            class="text-blue-600 hover:text-blue-800 underline text-sm"
        >
            ← Back to Edit Product（返回编辑产品）
        </a>
    </div>

    <!-- ================================= -->
    <!-- Upload New Image 上传新图片        -->
    <!-- ================================= -->
    <div class="border rounded-lg p-4 bg-gray-50 space-y-3">
        <h2 class="text-lg font-medium">Upload New Image（上传新图片）</h2>

        {#if uploadSuccess}
            <div
                class="rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700"
            >
                ✅ Upload successful!（上传成功！）
            </div>
        {/if}

        {#if uploadError}
            <div
                class="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
                ❌ {uploadError}
            </div>
        {/if}

        <form
            method="POST"
            action="?/upload"
            enctype="multipart/form-data"
            use:enhance={() => {
                uploading = true;
                return async ({ update }) => {
                    await update();
                    uploading = false;
                };
            }}
            class="space-y-3"
        >
            <input
                type="file"
                name="image"
                accept="image/*"
                required
                class="block w-full text-sm text-gray-700 border rounded p-2"
            />

            <button
                type="submit"
                disabled={uploading}
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {uploading ? "Uploading...（上传中...）" : "Upload（上传）"}
            </button>
        </form>
    </div>

    <!-- ================================= -->
    <!-- Images Grid 图片列表               -->
    <!-- ================================= -->
    {#if images.length === 0}
        <div class="text-center py-12 text-gray-500">
            No images uploaded yet.（尚未上传图片）
        </div>
    {:else}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            {#each images as img}
                <div class="border rounded-lg p-2 bg-white space-y-2">
                    <!-- Thumbnail -->
                    <div class="w-full h-40 overflow-hidden rounded bg-gray-100">
                        <img
                            src={getImageUrl(img.url)}
                            alt={product.name}
                            class="w-full h-full object-cover"
                            on:error={(e) => {
                                console.error('Image failed to load:', img.url);
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                        />
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
                            <form
                                method="POST"
                                action="?/setPrimary"
                                use:enhance
                                class="flex-1"
                            >
                                <input
                                    type="hidden"
                                    name="imageId"
                                    value={img.id}
                                />
                                <button
                                    type="submit"
                                    class="w-full px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                >
                                    Set Primary（设为主图）
                                </button>
                            </form>
                        {/if}

                        <form
                            method="POST"
                            action="?/delete"
                            use:enhance={() => {
                                return async ({ update }) => {
                                    if (confirm("Delete this image?（确定要删除此图片吗？）")) {
                                        await update();
                                    }
                                };
                            }}
                            class="flex-1"
                        >
                            <input
                                type="hidden"
                                name="imageId"
                                value={img.id}
                            />
                            <button
                                type="submit"
                                class="w-full px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Delete（删除）
                            </button>
                        </form>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>