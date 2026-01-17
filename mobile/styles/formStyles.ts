import { StyleSheet } from 'react-native';

export const getFormStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    padding: 24,
  },

  card: {
    padding: 24,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backgroundColor: isDark ? '#1E1E1E' : '#FFF',
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 25,
    textAlign: 'center',
    color: isDark ? '#FFF' : '#333',
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 10,
    textTransform: 'uppercase',
    color: isDark ? '#AAA' : '#666',
  },

  // Toggle Switch / Tab Jenis
  typeContainer: {
    flexDirection: 'row',
    borderRadius: 15,
    padding: 6,
    marginBottom: 10,
    backgroundColor: isDark ? '#252525' : '#E0E4E8',
  },

  typeTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  activeTabIn: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
    elevation: 3,
  },

  activeTabOut: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
    elevation: 3,
  },

  typeText: {
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Input Fields
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    backgroundColor: isDark ? '#252525' : '#F9F9F9',
    borderColor: isDark ? '#333' : '#DDD',
  },

  currencyPrefix: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#27ae60',
  },

  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: isDark ? '#FFF' : '#000',
  },