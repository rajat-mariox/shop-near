// Category-specific field value ko dikhane layak text me badlo
// (boolean -> Yes/No, multiselect -> comma list, number -> unit ke saath)
export const formatAttrValue = (a) => {
  if (a.type === 'boolean' || typeof a.value === 'boolean') return a.value ? 'Yes' : 'No';
  if (Array.isArray(a.value)) return a.value.join(', ');
  const v = a.value === undefined || a.value === null ? '' : String(a.value);
  return a.unit ? `${v} ${a.unit}` : v;
};

// Sirf woh fields jinki value bhari ho
export const visibleAttributes = (attributes) =>
  (Array.isArray(attributes) ? attributes : []).filter((a) => formatAttrValue(a) !== '');
