import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { users } from 'data/users';
import * as yup from 'yup';
import { userSchema } from '../../appraisal-list/add-member/useAddMemberForm';

export const newCycleFormSchema = yup.object({
  name: yup.string().required('Cycle name is required'),
  reviewPeriod: yup
    .tuple([
      yup.date().required('Start date is required'),
      yup.date().required('End date is required'),
    ])
    .required('Please select a date range')
    .test('chronological', 'End date cannot be before start date', (value) => {
      if (!value) return false;
      const [start, end] = value;
      return start && end && end >= start;
    }),

  startDate: yup.date().required('Start date is required'),
  dueDate: yup
    .date()
    .required('Due date is required')
    .min(yup.ref('startDate'), 'Due date cannot be before start date'),
  mainEvaluator: userSchema.required(),
  template: yup.string().required('Template is required'),
});

const useNewCycleForm = () => {
  const methods = useForm({
    resolver: yupResolver(newCycleFormSchema),
    defaultValues: {
      name: '',
      reviewPeriod: [new Date(2025, 0, 7), new Date(2025, 1, 2)],
      startDate: new Date(2025, 3, 1),
      dueDate: new Date(2025, 3, 28),
      mainEvaluator: users[0],
      template: 'Annual Review',
    },
  });
  return methods;
};

export default useNewCycleForm;
