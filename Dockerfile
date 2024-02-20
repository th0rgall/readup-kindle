FROM denoland/deno:debian-1.40.5

EXPOSE 8000

WORKDIR /app

# Ownership of /app dir necessary because deno cache creates /app/node_modules/.deno
RUN mkdir -p /home/deno/.cache && chown -R deno:deno /home/deno ./

# Prefer not to run as root.
USER deno

# Cache the dependencies as a layer (the following two steps are re-run only when main.ts is modified).
# TODO: use a deps.ts file, use it for all external deps

# These steps will be re-run upon each file change in your working directory:
COPY . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache main.ts

# Start
CMD ["/bin/sh", "-c", "deno run \
    --allow-net \
    --allow-env \
    # somehow needed by esbuild, which is used by our only npm: import
    # also: https://github.com/denoland/deno/issues/19864 
    --allow-read=./,$HOME/.cache,$(which deno),/deno-dir \
    --allow-write=$HOME/.cache \
    # needs to used to run $HOME/deno/cache/esbuild/bin/@esbuild-linux-${ARCH}-${VERSION} which
    # which is only available after deno installs it, so difficult to specify ahead of time
    --allow-run \
    main.ts"]