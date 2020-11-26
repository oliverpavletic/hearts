import path from 'path'

export const PORT = 4000

export enum DEPLOYMENT_MODES {
  PROD = 'PROD',
  DEV = 'DEV',
}

export const MODE = DEPLOYMENT_MODES.PROD

const CLIENT_BASE_PATH = path.join(__dirname, '..', 'client')

export const PUBLIC_PATH = path.join(CLIENT_BASE_PATH, 'public')

export const STATIC_PATH = path.join(CLIENT_BASE_PATH, 'build')
