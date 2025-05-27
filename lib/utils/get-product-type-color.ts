export const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'shampoo':
      return 'bg-purple-100 text-purple-800';
    case 'conditioner':
      return 'bg-blue-100 text-blue-800';
    case 'leave-in':
      return 'bg-teal-100 text-teal-800';
    case 'oil':
      return 'bg-yellow-100 text-yellow-800';
    case 'gel':
      return 'bg-green-100 text-green-800';
    case 'mousse':
      return 'bg-pink-100 text-pink-800';
    case 'cream':
      return 'bg-orange-100 text-orange-800';
    case 'spray':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};
