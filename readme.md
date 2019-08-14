# Cloudflare Purge Cache Action

This is a Github action. Read more about those here: [https://developer.github.com/actions/](https://developer.github.com/actions/)

The default behaviour is to **purge everything**. If you don't want to blow your whole site cache away, 
make sure you define specific files using the fileList arg (ALPHA. DO NOT USE IN HIGH VALUE PIPELINES).

## Usage

`your-workflow.yml`
```yaml
    - name: Purge cache
      uses: 3stacks/cloudflare-purge-cache-action@1.0.1
      with:
        authToken: ${{ secrets.CLOUDFLARE_AUTH_TOKEN }}
        siteName: somesite.com
        authEmail: me@example.com
        fileList: <NOT YET OFFICIALLY SUPPORTED> "[\"http://somesite.com/index.html\",\"http://somesite.com/cat-picture.jpg\"]"
```

### Arguments

All arguments are of type `string`.

| Arg Name  | Required | Default Value | Description | Reference |
| --------- | -------- | ------------- | ---------- | --------- |
| authToken | Yes      | nil           | Generated on your user profile in Cloudflare. Store in secrets!     | [https://api.cloudflare.com/#getting-started-requests](https://api.cloudflare.com/#getting-started-requests) |
| siteName  | Yes      | nil           | The name of the site/zone you're targeting          |           |
| authEmail | Yes      | nil           | The email associated with your Cloudflare account         |           |
| fileList | Yes      | nil           | This will be stringified JSON. See the format of files  | [https://api.cloudflare.com/#zone-purge-files-by-url](https://api.cloudflare.com/#zone-purge-files-by-url)          |