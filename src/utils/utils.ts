export function getPublicId(url: string): string {
  const parts:string = url.split("/upload/")[1] || "";
  return parts.replace(/\.[^/.]+$/, "");
}