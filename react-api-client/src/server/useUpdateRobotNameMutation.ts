import {
  UseMutationResult,
  UseMutationOptions,
  useMutation,
  UseMutateFunction,
  useQueryClient,
} from 'react-query'
import { updateRobotName } from '@opentrons/api-client'
import { useHost } from '../api'
import type { AxiosError } from 'axios'
import type {
  ErrorResponse,
  HostConfig,
  UpdatedRobotName,
} from '@opentrons/api-client'

export type UseUpdateRobotNameMutationResult = UseMutationResult<
  UpdatedRobotName,
  AxiosError<ErrorResponse>,
  string
> & {
  updateRobotName: UseMutateFunction<
    UpdatedRobotName,
    AxiosError<ErrorResponse>,
    string
  >
}

export type UseUpdateRobotNameMutationOptions = UseMutationOptions<
  UpdatedRobotName,
  AxiosError<ErrorResponse>,
  string
>

export function useUpdateRobotNameMutation(
  options: UseUpdateRobotNameMutationOptions = {}
): UseUpdateRobotNameMutationResult {
  const host = useHost()
  const queryClient = useQueryClient()

  console.log('host info: ', host)

  const mutation = useMutation<
    UpdatedRobotName,
    AxiosError<ErrorResponse>,
    string
  >(
    [host, 'server/name'],
    (newName: string) =>
      updateRobotName(host as HostConfig, newName).then(response => {
        const robotName = response.data.name
        queryClient
          .invalidateQueries([host, 'server/name'])
          .then(() =>
            queryClient.setQueryData(
              [host, 'server/name', robotName],
              response.data
            )
          )
          .catch(e => {
            console.error(e)
          })
        return response.data
      }),
    options
  )
  return {
    ...mutation,
    updateRobotName: mutation.mutate,
  }
}
