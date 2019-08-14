import core from '@actions/core';
import axios from 'axios';

async function run() {
	try {
		const authToken = core.getInput('authToken', { required: true });
		const siteName = core.getInput('siteName', { required: true });
		const authEmail = core.getInput('authEmail', { required: true });
		const fileList = JSON.parse(core.getInput('fileList', { required: true }));

		if (fileList.length > 0) {
		    const areFilesValid = fileList.reduce((acc, curr) => {
		        if (!acc) {
		            return false;
                }

		        return typeof curr === 'string' || curr.url;
            }, true);

		    if (!areFilesValid) {
                core.setFailed('File list is formatted incorrectly. See https://api.cloudflare.com/#zone-purge-files-by-url for details');
            }
        }

        const zoneID = await getZoneID(
            authToken,
            siteName,
            authEmail
        );
        const response = await axios.post(
            `https://api.cloudflare.com/client/v4/zones/${zoneID}/purge_cache`,
            {
                purge_everything: fileList.length === 0,
                fileList: fileList.length === 0 ? undefined : fileList
            },
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'X-Auth-Email': authEmail
                }
            }
        );
	} catch (error) {
		core.setFailed(error.message);
	}
}

function getZoneID(
	authToken: string,
	siteName: string,
	authEmail: string
): Promise<string> {
	return new Promise(async (resolve, reject) => {
		try {
			const response = await axios.get(
				'https://api.cloudflare.com/client/v4/zones',
				{
					headers: {
						Authorization: `Bearer ${authToken}`,
						'X-Auth-Email': authEmail
					}
				}
			);

			const targetZone = response.data.result.find(
				site => site.name === siteName
			);

			if (!targetZone) {
				reject(
					'Your zone was not found. Are you sure you passed the right name?'
				);
			}

			resolve(targetZone.id);
		} catch (e) {
			reject(e);
		}
	});
}

run();
