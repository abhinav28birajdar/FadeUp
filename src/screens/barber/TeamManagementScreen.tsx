/**
 * Barber Team Management Screen
 * Manage staff, barbers, and permissions
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, TabBar } from '../../components/ui';
import { useTheme } from '../../theme';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'manager' | 'barber' | 'assistant';
  avatar: string;
  status: 'active' | 'offline' | 'busy';
  specialties: string[];
  rating: number;
  reviewCount: number;
  totalServices: number;
  joinDate: string;
  isAvailable: boolean;
  commission: number;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Mike Anderson',
    email: 'mike@barbershop.com',
    phone: '+1 (555) 123-4567',
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    status: 'active',
    specialties: ['Fades', 'Classic Cuts', 'Beard Styling'],
    rating: 4.9,
    reviewCount: 156,
    totalServices: 1250,
    joinDate: '2020-01-15',
    isAvailable: true,
    commission: 100,
  },
  {
    id: '2',
    name: 'James Wilson',
    email: 'james@barbershop.com',
    phone: '+1 (555) 234-5678',
    role: 'barber',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    status: 'busy',
    specialties: ['Modern Styles', 'Hair Coloring'],
    rating: 4.7,
    reviewCount: 89,
    totalServices: 645,
    joinDate: '2021-06-20',
    isAvailable: true,
    commission: 60,
  },
  {
    id: '3',
    name: 'David Brown',
    email: 'david@barbershop.com',
    phone: '+1 (555) 345-6789',
    role: 'barber',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    status: 'active',
    specialties: ['Beard Trims', 'Hot Towel Shave'],
    rating: 4.8,
    reviewCount: 112,
    totalServices: 890,
    joinDate: '2020-11-10',
    isAvailable: true,
    commission: 55,
  },
  {
    id: '4',
    name: 'Chris Taylor',
    email: 'chris@barbershop.com',
    phone: '+1 (555) 456-7890',
    role: 'assistant',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    status: 'offline',
    specialties: ['Washing', 'Styling'],
    rating: 4.5,
    reviewCount: 34,
    totalServices: 156,
    joinDate: '2023-03-05',
    isAvailable: false,
    commission: 40,
  },
];

type TabType = 'all' | 'active' | 'offline';

export const TeamManagementScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('barber');

  const tabs = [
    { key: 'all', label: `All (${mockTeamMembers.length})` },
    { key: 'active', label: `Active (${mockTeamMembers.filter(m => m.status !== 'offline').length})` },
    { key: 'offline', label: `Offline (${mockTeamMembers.filter(m => m.status === 'offline').length})` },
  ];

  const filteredMembers = mockTeamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && member.status !== 'offline') ||
      (activeTab === 'offline' && member.status === 'offline');
    return matchesSearch && matchesTab;
  });

  const getRoleColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return theme.colors.primary[500];
      case 'manager':
        return theme.colors.warning[500];
      case 'barber':
        return theme.colors.success[500];
      case 'assistant':
        return theme.colors.neutral[400];
    }
  };

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return theme.colors.success[500];
      case 'busy':
        return theme.colors.warning[500];
      case 'offline':
        return theme.colors.neutral[400];
    }
  };

  const handleInvite = () => {
    if (!inviteEmail) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    // Handle invite logic
    Alert.alert('Success', `Invitation sent to ${inviteEmail}`);
    setInviteModalVisible(false);
    setInviteEmail('');
  };

  const handleRemoveMember = (member: TeamMember) => {
    Alert.alert(
      'Remove Team Member',
      `Are you sure you want to remove ${member.name} from the team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => console.log('Remove member:', member.id),
        },
      ]
    );
  };

  const renderTeamStats = () => (
    <LinearGradient
      colors={[theme.colors.primary[500], theme.colors.primary[700]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.statsCard}
    >
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{mockTeamMembers.length}</Text>
        <Text style={styles.statLabel}>Team Members</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>
          {mockTeamMembers.filter((m) => m.status !== 'offline').length}
        </Text>
        <Text style={styles.statLabel}>Available Now</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>
          {mockTeamMembers
            .reduce((acc, m) => acc + m.totalServices, 0)
            .toLocaleString()}
        </Text>
        <Text style={styles.statLabel}>Total Services</Text>
      </View>
    </LinearGradient>
  );

  const renderMemberCard = ({ item }: { item: TeamMember }) => (
    <TouchableOpacity
      style={[styles.memberCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => router.push(`/team/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.memberHeader}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          />
        </View>
        <View style={styles.memberInfo}>
          <View style={styles.nameRow}>
            <Text
              style={[styles.memberName, { color: theme.colors.text.primary }]}
            >
              {item.name}
            </Text>
            {item.role === 'owner' && (
              <Ionicons
                name="star"
                size={16}
                color={theme.colors.warning[400]}
              />
            )}
          </View>
          <View style={styles.roleRow}>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: getRoleColor(item.role) + '20' },
              ]}
            >
              <Text
                style={[styles.roleText, { color: getRoleColor(item.role) }]}
              >
                {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
              </Text>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons
                name="star"
                size={12}
                color={theme.colors.warning[400]}
              />
              <Text
                style={[styles.ratingText, { color: theme.colors.text.secondary }]}
              >
                {item.rating} ({item.reviewCount})
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            Alert.alert(
              item.name,
              'Choose an action',
              [
                { text: 'View Profile', onPress: () => router.push(`/team/${item.id}`) },
                { text: 'Edit', onPress: () => router.push(`/team/${item.id}/edit`) },
                { text: 'Message', onPress: () => router.push(`/chat/${item.id}`) },
                item.role !== 'owner' && {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: () => handleRemoveMember(item),
                },
                { text: 'Cancel', style: 'cancel' },
              ].filter(Boolean) as any
            );
          }}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={theme.colors.text.muted}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.specialtiesContainer}>
        {item.specialties.slice(0, 3).map((specialty, index) => (
          <View
            key={index}
            style={[
              styles.specialtyBadge,
              { backgroundColor: theme.colors.neutral[100] },
            ]}
          >
            <Text
              style={[styles.specialtyText, { color: theme.colors.text.secondary }]}
            >
              {specialty}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.memberStats}>
        <View style={styles.memberStatItem}>
          <Ionicons
            name="cut-outline"
            size={16}
            color={theme.colors.text.muted}
          />
          <Text
            style={[styles.memberStatText, { color: theme.colors.text.secondary }]}
          >
            {item.totalServices} services
          </Text>
        </View>
        <View style={styles.memberStatItem}>
          <Ionicons
            name="cash-outline"
            size={16}
            color={theme.colors.text.muted}
          />
          <Text
            style={[styles.memberStatText, { color: theme.colors.text.secondary }]}
          >
            {item.commission}% commission
          </Text>
        </View>
      </View>

      {!item.isAvailable && (
        <View
          style={[
            styles.unavailableBanner,
            { backgroundColor: theme.colors.warning[50] },
          ]}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={theme.colors.warning[600]}
          />
          <Text
            style={[styles.unavailableText, { color: theme.colors.warning[700] }]}
          >
            Currently unavailable for bookings
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderInviteModal = () => (
    <Modal
      visible={inviteModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setInviteModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
              Invite Team Member
            </Text>
            <TouchableOpacity onPress={() => setInviteModalVisible(false)}>
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>
            Email Address
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.background,
                color: theme.colors.text.primary,
                borderColor: theme.colors.neutral[200],
              },
            ]}
            placeholder="Enter email address"
            placeholderTextColor={theme.colors.text.muted}
            value={inviteEmail}
            onChangeText={setInviteEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>
            Role
          </Text>
          <View style={styles.roleOptions}>
            {(['barber', 'manager', 'assistant'] as const).map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleOption,
                  {
                    backgroundColor:
                      inviteRole === role
                        ? theme.colors.primary[500]
                        : theme.colors.neutral[100],
                  },
                ]}
                onPress={() => setInviteRole(role)}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    {
                      color:
                        inviteRole === role
                          ? '#FFFFFF'
                          : theme.colors.text.secondary,
                    },
                  ]}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.inviteButton,
              { backgroundColor: theme.colors.primary[500] },
            ]}
            onPress={handleInvite}
          >
            <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" />
            <Text style={styles.inviteButtonText}>Send Invitation</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Team
        </Text>
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: theme.colors.primary[500] },
          ]}
          onPress={() => setInviteModalVisible(true)}
        >
          <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        {renderTeamStats()}
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <View
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={theme.colors.text.muted}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text.primary }]}
            placeholder="Search team members..."
            placeholderTextColor={theme.colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.colors.text.muted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
        style={{ marginHorizontal: 16, marginBottom: 16 }}
      />

      {/* Team List */}
      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        renderItem={renderMemberCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={64}
              color={theme.colors.text.muted}
            />
            <Text
              style={[styles.emptyText, { color: theme.colors.text.secondary }]}
            >
              No team members found
            </Text>
          </View>
        }
      />

      {renderInviteModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  memberCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
  },
  menuButton: {
    padding: 4,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  specialtyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specialtyText: {
    fontSize: 12,
  },
  memberStats: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  memberStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberStatText: {
    fontSize: 13,
  },
  unavailableBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
  },
  unavailableText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 16,
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TeamManagementScreen;
