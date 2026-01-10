/**
 * Queue Hooks
 * TanStack Query hooks for queue-related data fetching with real-time support
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getSupabase } from '../config/supabase';
import { QueueEntry, queueService } from '../services/supabase';

// Query keys for cache management
export const queueKeys = {
  all: ['queue'] as const,
  lists: () => [...queueKeys.all, 'list'] as const,
  shopQueue: (shopId: string) => [...queueKeys.all, 'shop', shopId] as const,
  position: (shopId: string, customerId: string) =>
    [...queueKeys.all, 'position', shopId, customerId] as const,
  myPosition: (customerId: string) =>
    [...queueKeys.all, 'myPosition', customerId] as const,
  stats: (shopId: string) => [...queueKeys.all, 'stats', shopId] as const,
};

/**
 * Hook to fetch shop's queue with optional real-time updates
 */
export function useShopQueue(shopId: string, enableRealtime: boolean = true) {
  const queryClient = useQueryClient();

  // Subscribe to real-time updates
  useEffect(() => {
    if (!enableRealtime || !shopId) return;

    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel(`queue:${shopId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries',
          filter: `shop_id=eq.${shopId}`,
        },
        (payload) => {
          // Invalidate and refetch queue data
          queryClient.invalidateQueries({ queryKey: queueKeys.shopQueue(shopId) });
          queryClient.invalidateQueries({ queryKey: queueKeys.stats(shopId) });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, enableRealtime, queryClient]);

  return useQuery({
    queryKey: queueKeys.shopQueue(shopId),
    queryFn: () => queueService.getShopQueue(shopId),
    enabled: !!shopId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch customer's position in queue
 */
export function useQueuePosition(shopId: string, customerId: string) {
  return useQuery({
    queryKey: queueKeys.position(shopId, customerId),
    queryFn: () => queueService.getCustomerPosition(shopId, customerId),
    enabled: !!shopId && !!customerId,
    staleTime: 15 * 1000, // 15 seconds
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
  });
}

/**
 * Hook to fetch customer's active queue entry (if any)
 */
export function useMyQueueStatus(customerId: string) {
  return useQuery({
    queryKey: queueKeys.myPosition(customerId),
    queryFn: () => queueService.getCustomerActiveEntry(customerId),
    enabled: !!customerId,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });
}

/**
 * Hook to fetch queue statistics for a shop
 */
export function useQueueStats(shopId: string) {
  return useQuery({
    queryKey: queueKeys.stats(shopId),
    queryFn: () => queueService.getQueueStats(shopId),
    enabled: !!shopId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to join the queue
 */
export function useJoinQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      shopId,
      customerId,
      serviceIds,
    }: {
      shopId: string;
      customerId: string;
      serviceIds: string[];
      barberId?: string;
      notes?: string;
    }) =>
      queueService.joinQueue(shopId, customerId, serviceIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queueKeys.shopQueue(variables.shopId),
      });
      queryClient.invalidateQueries({
        queryKey: queueKeys.myPosition(variables.customerId),
      });
    },
  });
}

/**
 * Hook to leave the queue
 */
export function useLeaveQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entryId,
      shopId,
      customerId,
    }: {
      entryId: string;
      shopId: string;
      customerId: string;
    }) => queueService.leaveQueue(entryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queueKeys.shopQueue(variables.shopId),
      });
      queryClient.invalidateQueries({
        queryKey: queueKeys.myPosition(variables.customerId),
      });
    },
  });
}

/**
 * Hook to update queue entry status (for barbers)
 */
export function useUpdateQueueEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entryId,
      status,
      shopId,
    }: {
      entryId: string;
      status: QueueEntry['status'];
      shopId: string;
    }) => queueService.updateQueueStatus(entryId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queueKeys.shopQueue(variables.shopId),
      });
    },
  });
}

/**
 * Hook to call next customer (for barbers)
 */
export function useCallNextCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId, shopId }: { entryId: string; shopId: string }) =>
      queueService.callCustomer(entryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queueKeys.shopQueue(variables.shopId),
      });
    },
  });
}

/**
 * Hook to start service for a customer (for barbers)
 */
export function useStartService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entryId,
      shopId,
      barberId,
    }: {
      entryId: string;
      shopId: string;
      barberId: string;
    }) => queueService.startService(entryId, barberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queueKeys.shopQueue(variables.shopId),
      });
    },
  });
}

/**
 * Hook to complete service for a customer (for barbers)
 */
export function useCompleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId, shopId }: { entryId: string; shopId: string }) =>
      queueService.completeService(entryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queueKeys.shopQueue(variables.shopId),
      });
    },
  });
}

/**
 * Hook to mark customer as no-show (for barbers)
 */
export function useMarkNoShow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId, shopId }: { entryId: string; shopId: string }) =>
      queueService.markNoShow(entryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queueKeys.shopQueue(variables.shopId),
      });
    },
  });
}

export default {
  useShopQueue,
  useQueuePosition,
  useMyQueueStatus,
  useQueueStats,
  useJoinQueue,
  useLeaveQueue,
  useUpdateQueueEntry,
  useCallNextCustomer,
  useStartService,
  useCompleteService,
  useMarkNoShow,
};
