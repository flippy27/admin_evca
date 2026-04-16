/**
 * Location Selector - Multi-select dropdown
 * Shows selected locations as chips + dropdown to change selection
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { Button } from './Button';
import { getThemeColors, spacing } from '@/theme';
import { useLocationsStore } from '@/lib/stores/locations.store';

export function LocationSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const colors = getThemeColors('light');

  const { locations, selectedLocationIds, setSelectedLocationIds, selectAll, clearSelection } =
    useLocationsStore();

  const selectedNames = locations
    .filter((loc) => selectedLocationIds.includes(loc.id))
    .map((loc) => loc.name);

  const handleToggle = (id: string) => {
    const updated = selectedLocationIds.includes(id)
      ? selectedLocationIds.filter((locId) => locId !== id)
      : [...selectedLocationIds, id];
    setSelectedLocationIds(updated);
  };

  const handleApply = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Selected Locations - Chip Bar or Button */}
      <View
        style={[
          styles.chipBar,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        {selectedNames.length > 0 ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
              <View style={styles.chipContainer}>
                {selectedNames.slice(0, 2).map((name, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: colors.primary + '20',
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text variant="caption" style={{ color: colors.primary }}>
                      {name.length > 12 ? name.substring(0, 12) + '...' : name}
                    </Text>
                  </View>
                ))}
                {selectedNames.length > 2 && (
                  <View
                    style={[
                      styles.chip,
                      {
                        backgroundColor: colors.primary + '20',
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text variant="caption" style={{ color: colors.primary }}>
                      +{selectedNames.length - 2}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </>
        ) : (
          <Text variant="body" style={{ color: colors.mutedForeground, flex: 1 }}>
            Select locations...
          </Text>
        )}

        {/* Toggle Button */}
        <TouchableOpacity
          onPress={() => setIsOpen(true)}
          style={[styles.toggleBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="filter" size={16} color="white" />
        </TouchableOpacity>
      </View>

      {/* Modal Dropdown */}
      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        />

        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.card,
              height: Math.min(Dimensions.get('window').height * 0.7, 450),
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.dropdownHeader,
              {
                borderBottomColor: colors.border,
              },
            ]}
          >
            <Text variant="h4" weight="bold">
              Seleccionar Ubicaciones
            </Text>
            <TouchableOpacity onPress={() => setIsOpen(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* Select All */}
          <TouchableOpacity
            onPress={() => selectAll()}
            style={[
              styles.option,
              {
                backgroundColor:
                  selectedLocationIds.length === locations.length ? colors.primary + '10' : 'transparent',
              },
            ]}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: colors.primary,
                  backgroundColor:
                    selectedLocationIds.length === locations.length
                      ? colors.primary
                      : 'transparent',
                },
              ]}
            >
              {selectedLocationIds.length === locations.length && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
            <Text variant="body" weight="bold" style={{ color: colors.primary }}>
              Seleccionar todos
            </Text>
          </TouchableOpacity>

          {/* Location List */}
          <ScrollView style={styles.optionList}>
            {locations.map((location) => {
              const isSelected = selectedLocationIds.includes(location.id);
              return (
                <TouchableOpacity
                  key={location.id}
                  onPress={() => handleToggle(location.id)}
                  style={[
                    styles.option,
                    {
                      backgroundColor: isSelected ? colors.primary + '10' : 'transparent',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: colors.primary,
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                  <Text variant="body" style={{ color: colors.foreground }}>
                    {location.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer - Apply Button */}
          <View style={[styles.dropdownFooter, { borderTopColor: colors.border }]}>
            <Button label="Aplicar" variant="primary" onPress={handleApply} fullWidth />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chipBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  toggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  dropdown: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionList: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownFooter: {
    paddingVertical: 12,
    borderTopWidth: 1,
  },
});
