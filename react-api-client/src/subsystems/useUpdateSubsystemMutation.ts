import { useMutation, useQueryClient } from 'react-query'
import {
  updateSubsystem,
  SubsystemUpdateProgressData,
  Subsystem,
} from '@opentrons/api-client'
import { useHost } from '../api'
import type { HostConfig } from '@opentrons/api-client'
import type {
  UseMutationResult,
  UseMutateFunction,
  UseMutationOptions,
} from 'react-query'
import type { AxiosError } from 'axios'

export type UseUpdateSubsystemMutationResult = UseMutationResult<
  SubsystemUpdateProgressData,
  AxiosError,
  Subsystem
> & {
  updateSubsystem: UseMutateFunction<
    SubsystemUpdateProgressData,
    AxiosError,
    Subsystem
  >
}
export type UseUpdateSubsystemMutationOptions = UseMutationOptions<
  SubsystemUpdateProgressData,
  AxiosError,
  Subsystem
>

export function useUpdateSubsystemMutation(
  options: UseUpdateSubsystemMutationOptions = {}
): UseUpdateSubsystemMutationResult {
  const host = useHost()
  const queryClient = useQueryClient()

  const mutation = useMutation<
    SubsystemUpdateProgressData,
    AxiosError,
    Subsystem
  >(
    (subsystem: Subsystem) =>
      updateSubsystem(host as HostConfig, subsystem).then(response => {
        queryClient.removeQueries([host, 'subsystems/updates'])
        queryClient
          .invalidateQueries([host, 'subsystems/updates'])
          .catch((e: Error) =>
            console.error(`error invalidating subsystems query: ${e.message}`)
          )
        return response.data
      }),
    options
  )

  return {
    ...mutation,
    updateSubsystem: mutation.mutate,
  }
}
