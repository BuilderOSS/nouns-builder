import { farcasterClient } from '../client'
import { UserDataType } from '@farcaster/hub-nodejs'

const { FNAME, PFP, DISPLAY } = UserDataType as any

const logFetchError = (dataType: string, fid: number, errorMsg: string) => {
  console.error(
    `${dataType} Not Found 
       Error: ${errorMsg}
       fid: ${fid}
      `,
  )
}

export const getfName = async (fid: number) => {
  const client = farcasterClient()

  const fName = await client.getUserData({ fid, userDataType: FNAME })
  client.close()
  if (fName.isErr()) logFetchError('Farcaster Name', fid, fName.error.message)
  return {
    fName: fName.isOk() ? fName.value.data?.userDataBody?.value : undefined,
  }
}

export const getFarcasterProfile = async (fid: number) => {
  const client = farcasterClient()

  const [pfpRes, nameRes, fName] = await Promise.all([
    client.getUserData({ fid, userDataType: PFP }),
    client.getUserData({ fid, userDataType: DISPLAY }),
    client.getUserData({ fid, userDataType: FNAME }),
  ])

  client.close()

  // Decided to not throw errors here as that would block either the
  // entire feed or the entire profile from loading. Instead, I'll
  // try to log the error with as many details as possible

  if (nameRes.isErr()) logFetchError('Display Name', fid, nameRes.error.message)
  if (pfpRes.isErr()) logFetchError('Profile Picture', fid, pfpRes.error.message)
  if (fName.isErr()) logFetchError('Farcaster Name', fid, fName.error.message)

  // Neverthrow typing didn't allow for optional chaining checks. Need to use isOk() instead.
  return {
    displayName: nameRes.isOk() ? nameRes.value.data?.userDataBody?.value : undefined,
    pfp: pfpRes.isOk() ? pfpRes.value.data?.userDataBody?.value : undefined,
    fName: fName.isOk() ? fName.value.data?.userDataBody?.value : undefined,
  }
}
