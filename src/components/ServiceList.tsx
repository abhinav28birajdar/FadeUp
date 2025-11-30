import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { UI_CONFIG, VALIDATION_CONFIG } from '../config/constants';
import { serviceService } from '../services/firestore';
import { Service } from '../types';
import { formatDuration } from '../utils/time';

interface ServiceListProps {
  services: Service[];
  shopId: string;
  isOwner: boolean;
  onServicesUpdated?: (services: Service[]) => void;
}

interface ServiceModalProps {
  visible: boolean;
  service?: Service;
  shopId: string;
  onClose: () => void;
  onSaved: (service: Service) => void;
}

function ServiceModal({ visible, service, shopId, onClose, onSaved }: ServiceModalProps) {
  const [title, setTitle] = useState(service?.title || '');
  const [description, setDescription] = useState(service?.description || '');
  const [price, setPrice] = useState(service?.price?.toString() || '');
  const [duration, setDuration] = useState(service?.durationMinutes?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a service title');
      return;
    }

    const priceNumber = parseFloat(price);
    const durationNumber = parseInt(duration);

    if (isNaN(priceNumber) || priceNumber <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    if (isNaN(durationNumber) || durationNumber <= 0 || durationNumber > 480) {
      Alert.alert('Error', 'Duration must be between 1 and 480 minutes');
      return;
    }

    try {
      setLoading(true);

      const serviceData = {
        title: title.trim(),
        description: description.trim() || undefined,
        price: priceNumber,
        durationMinutes: durationNumber,
        isActive: true,
      };

      if (service) {
        // Update existing service
        await serviceService.update(service.id, serviceData);
        const updatedService = { ...service, ...serviceData, updatedAt: new Date() };
        onSaved(updatedService);
      } else {
        // Create new service
        const serviceId = await serviceService.create({
          ...serviceData,
          shopId,
        });
        const newService: Service = {
          id: serviceId,
          shopId,
          ...serviceData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        onSaved(newService);
      }

      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {service ? 'Edit Service' : 'Add Service'}
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={styles.saveButton}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Name *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Haircut & Style"
              maxLength={VALIDATION_CONFIG.maxServiceNameLength}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Brief description of the service..."
              multiline
              numberOfLines={2}
              maxLength={VALIDATION_CONFIG.maxDescriptionLength}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Price ($) *</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="25.00"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Duration (min) *</Text>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={setDuration}
                placeholder="30"
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function ServiceList({ services, shopId, isOwner, onServicesUpdated }: ServiceListProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>();

  const handleAddService = () => {
    setEditingService(undefined);
    setModalVisible(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setModalVisible(true);
  };

  const handleServiceSaved = (service: Service) => {
    if (onServicesUpdated) {
      const updatedServices = editingService
        ? services.map(s => s.id === service.id ? service : s)
        : [...services, service];
      onServicesUpdated(updatedServices);
    }
  };

  const handleDeleteService = (service: Service) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${service.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await serviceService.delete(service.id);
              if (onServicesUpdated) {
                onServicesUpdated(services.filter(s => s.id !== service.id));
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete service');
            }
          },
        },
      ]
    );
  };

  const renderService = ({ item }: { item: Service }) => (
    <View style={styles.serviceItem}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.serviceDescription}>{item.description}</Text>
        )}
        <View style={styles.serviceDetails}>
          <Text style={styles.servicePrice}>${item.price.toFixed(2)}</Text>
          <Text style={styles.serviceDuration}>
            {formatDuration(item.durationMinutes)}
          </Text>
        </View>
      </View>
      
      {isOwner && (
        <View style={styles.serviceActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditService(item)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteService(item)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View>
      {isOwner && (
        <TouchableOpacity style={styles.addButton} onPress={handleAddService}>
          <Text style={styles.addButtonText}>+ Add Service</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isOwner ? 'No services added yet' : 'No services available'}
            </Text>
          </View>
        }
      />

      <ServiceModal
        visible={modalVisible}
        service={editingService}
        shopId={shopId}
        onClose={() => setModalVisible(false)}
        onSaved={handleServiceSaved}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: UI_CONFIG.colors.primary,
    padding: UI_CONFIG.spacing.md,
    borderRadius: UI_CONFIG.borderRadius.lg,
    alignItems: 'center',
    marginBottom: UI_CONFIG.spacing.md,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: UI_CONFIG.fontSize.md,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: UI_CONFIG.spacing.md,
    backgroundColor: UI_CONFIG.colors.surface,
    borderRadius: UI_CONFIG.borderRadius.lg,
    marginBottom: UI_CONFIG.spacing.sm,
    borderWidth: 1,
    borderColor: UI_CONFIG.colors.border,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: UI_CONFIG.fontSize.md,
    fontWeight: '600',
    color: UI_CONFIG.colors.text,
  },
  serviceDescription: {
    fontSize: UI_CONFIG.fontSize.sm,
    color: UI_CONFIG.colors.textSecondary,
    marginTop: UI_CONFIG.spacing.xs,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: UI_CONFIG.spacing.xs,
  },
  servicePrice: {
    fontSize: UI_CONFIG.fontSize.md,
    fontWeight: '600',
    color: UI_CONFIG.colors.primary,
    marginRight: UI_CONFIG.spacing.md,
  },
  serviceDuration: {
    fontSize: UI_CONFIG.fontSize.sm,
    color: UI_CONFIG.colors.textSecondary,
  },
  serviceActions: {
    flexDirection: 'row',
  },
  editButton: {
    paddingHorizontal: UI_CONFIG.spacing.sm,
    paddingVertical: UI_CONFIG.spacing.xs,
    borderRadius: UI_CONFIG.borderRadius.sm,
    backgroundColor: UI_CONFIG.colors.info,
    marginRight: UI_CONFIG.spacing.xs,
  },
  editButtonText: {
    color: 'white',
    fontSize: UI_CONFIG.fontSize.xs,
    fontWeight: '500',
  },
  deleteButton: {
    paddingHorizontal: UI_CONFIG.spacing.sm,
    paddingVertical: UI_CONFIG.spacing.xs,
    borderRadius: UI_CONFIG.borderRadius.sm,
    backgroundColor: UI_CONFIG.colors.error,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: UI_CONFIG.fontSize.xs,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: UI_CONFIG.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: UI_CONFIG.fontSize.md,
    color: UI_CONFIG.colors.textSecondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: UI_CONFIG.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: UI_CONFIG.spacing.lg,
    paddingVertical: UI_CONFIG.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: UI_CONFIG.colors.border,
  },
  modalTitle: {
    fontSize: UI_CONFIG.fontSize.lg,
    fontWeight: '600',
    color: UI_CONFIG.colors.text,
  },
  cancelButton: {
    fontSize: UI_CONFIG.fontSize.md,
    color: UI_CONFIG.colors.textSecondary,
  },
  saveButton: {
    fontSize: UI_CONFIG.fontSize.md,
    color: UI_CONFIG.colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: UI_CONFIG.spacing.lg,
    paddingVertical: UI_CONFIG.spacing.lg,
  },
  inputGroup: {
    marginBottom: UI_CONFIG.spacing.lg,
  },
  label: {
    fontSize: UI_CONFIG.fontSize.md,
    fontWeight: '600',
    color: UI_CONFIG.colors.text,
    marginBottom: UI_CONFIG.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: UI_CONFIG.colors.border,
    borderRadius: UI_CONFIG.borderRadius.lg,
    paddingHorizontal: UI_CONFIG.spacing.md,
    paddingVertical: UI_CONFIG.spacing.md,
    fontSize: UI_CONFIG.fontSize.md,
    backgroundColor: UI_CONFIG.colors.surface,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
});