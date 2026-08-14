import { describe, expect, it } from "vitest";
import dockerfile from "../../../Dockerfile?raw";
import nginxConfig from "../../../nginx.conf?raw";

describe("production nginx cache contract", () => {
  it("installs the repository nginx configuration in the runtime image", () => {
    expect(dockerfile).toContain(
      "COPY nginx.conf /etc/nginx/conf.d/default.conf"
    );
  });

  it("never caches entry HTML while keeping hashed assets immutable", () => {
    expect(nginxConfig).toContain("location = /index.html");
    expect(nginxConfig).toContain(
      'Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"'
    );
    expect(nginxConfig).toContain("location /assets/");
    expect(nginxConfig).toContain(
      'Cache-Control "public, max-age=31536000, immutable"'
    );
    expect(nginxConfig).toContain("try_files $uri =404");
    expect(nginxConfig).toContain("try_files $uri $uri/ /index.html");
  });
});
