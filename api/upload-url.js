const imageUpload = document.getElementById("imageUpload");
const previewImage = document.getElementById("previewImage");

if (imageUpload && previewImage) {
  imageUpload.addEventListener("change", async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    try {
      const response = await fetch("/api/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "无法取得上传链接");
      }

      await fetch(data.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      previewImage.src = data.publicUrl;

      alert("上传成功！");
      console.log("图片地址：", data.publicUrl);
    } catch (error) {
      console.error(error);
      alert("上传失败，请检查 Vercel 环境变量或 GCS 权限");
    }
  });
}