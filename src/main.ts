import * as core from '@actions/core';
import axios from 'axios';

const baseUrl = 'https://api.cloudflare.com/client/v4';

async function run() {
	try {
		const authToken = core.getInput('authToken', { required: true });
		const siteName = core.getInput('siteName', { required: true });
		const authEmail = core.getInput('authEmail', { required: true });
		const rawFileList = core.getInput('fileList');
		const fileList = !!rawFileList ? JSON.parse(rawFileList) : [];
		if (fileList.length > 0) {
			const areFilesValid = fileList.reduce((acc, curr) => {
				if (!acc) {
					return false;
				}
				return typeof curr === 'string' || curr.url;
			}, true);

			if (!areFilesValid) {
				core.setFailed(
					'File list is formatted incorrectly. See https://api.cloudflare.com/#zone-purge-files-by-url for details'
				);
			}
		}
		let zoneId = await getZoneID(authToken, authEmail, siteName);
		if (zoneId.length === 0) {
			return;
		}
		const renderBody = () => {
			if (fileList.length === 0) {
				return {
					purge_everything: true
				};
			} else {
				return {
					files: fileList
				};
			}
		};

		let res = await axios.post(
			`${baseUrl}/zones/${zoneId}/purge_cache`,
			renderBody(),
			{
				headers: {
					Authorization: `Bearer ${authToken}`,
					'X-Auth-Email': authEmail
				}
			}
		);
		let { success } = res.data;
		if (success) {
			core.setOutput('res', `Purge ${siteName} cache success!`);
			return;
		}
		core.setFailed(`Purge ${siteName} cache fail!`);
	} catch (error) {
		core.setFailed(error.response.data.errors[0].message);
	}
}

async function getZoneID(
	authToken: string,
	authEmail: string,
	siteName: string
) {
	try {
		let res = await axios.get(`${baseUrl}/zones?name=${siteName}`, {
			headers: {
				Authorization: `Bearer ${authToken}`,
				'X-Auth-Email': authEmail
			}
		});
		let { result } = res.data;
		if (result.length != 0) {
			return result[0].id;
		}
		core.setFailed(`Query zoneId error, check your siteName: ${siteName}.`);
		return '';
	} catch (error) {
		core.setFailed(error.response.data.errors[0].message);
		return '';
	}
}

run();
