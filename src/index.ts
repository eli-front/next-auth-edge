import { IRequest, Router } from 'itty-router';

import { Auth, AuthConfig } from '@auth/core'
import Credentials from '@auth/core/providers/credentials';
import { Provider } from '@auth/core/providers';
import { getToken } from '@auth/core/jwt';


declare module globalThis {
	let process: { env: Env };
}
export interface Env {
	JWT_SECRET: string;
	NEXTAUTH_URL: string;
}

const router = Router();



const authConfig = (e: Env): AuthConfig => {
	return {
		providers: [
			Credentials({
				name: "Credentials",
				credentials: {
					email: { label: "Email", type: "text", placeholder: "example@email.com" },
					password: { label: "Password", type: "password", placeholder: "supersecret" },
				},
				async authorize(credentials, req) {

					return {
						id: "1",
						email: credentials?.email,
					}
				},
			}) as Provider,
		],
		trustHost: true,
		secret: e.JWT_SECRET,
	}
}


router// handle CORS preflight/OPTIONS requests
	.all('/api/auth/*', async (request: IRequest, env) => {

		console.log('here')

		const res = await Auth(request as unknown as Request, authConfig(env))

		console.log('res', res)

		res.headers.set('Access-Control-Allow-Origin', '*')

		return res
	})
	.get('/favicon.ico', () => new Response(null, { status: 204 }))
	.get('/', async (request: IRequest, env) => {

		globalThis.process = { env };
		const token = await getToken({ req: request as unknown as Request, secret: env.JWT_SECRET })


		// redirect to session endpoint
		const sessionUrl = env.NEXTAUTH_URL + '/session'
		const signinUrl = env.NEXTAUTH_URL + '/signin'
		const signoutUrl = env.NEXTAUTH_URL + '/signout'

		// return html with button to signin and view session and signout
		return new Response(`
			<html>
				<body>
					<h1>NextAuth.js</h1>
					<p>Token: ${token} -- not implemented</p>
					<a href="${signinUrl}">Sign in</a>
					<a href="${sessionUrl}">View session</a>
					<a href="${signoutUrl}">Sign out</a>
				</body>
			</html>
		`, {
			status: 200,
			headers: {
				'Content-Type': 'text/html',
			},
		})

	})

export default {
	fetch: router.handle
}