import core from '@actions/core';
import github from '@actions/github';

async function run() {
    try {
        const myInput = core.getInput('myInput');
        core.debug(`Hello ${myInput} from inside a container`);

        // Get github context data
        const context = github.context;
        console.log(`We can even get context data, like the repo: ${context.repo.repo}`)
    } catch (error) {
        core.setFailed(error.message);
    }
}

// run();

axios.post(`https://api.cloudflare.com/client/v4/zones/:identifier/purge_cache`, {}, {
    headers: {
        'X-Auth-Key': '',
        'X-Auth-Email': '',
        'X-Auth-User-Service-Key': ''
    }
});