import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { appraisalList } from 'data/hrm/performance-management';
import * as yup from 'yup';

export const userSchema = yup.object({
  id: yup.number().required(),
  name: yup.string().required(),
  avatar: yup.string().required(),
  email: yup.string().email().required(),
  status: yup.string().required(),
});

const appraisalMemberSchema = userSchema.shape({
  empId: yup.string().required(),
});

export const addMemberFormSchema = yup.object({
  member: appraisalMemberSchema.required(),

  department: yup.string().required('Department is required'),

  template: yup.string().required('Template is required'),

  appraisalName: yup.string().required('Appraisal name is required'),

  startDate: yup.date().required('Start date is required'),

  endDate: yup
    .date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date cannot be before start date'),

  mainEvaluator: userSchema.required(),

  otherEvaluators: userSchema.required(),
});

const useAddMemberForm = () => {
  const methods = useForm({
    resolver: yupResolver(addMemberFormSchema),
    defaultValues: {
      member: appraisalList[0].member,
      department: 'Engineering',
      template: 'Annual Review',
      appraisalName: 'Mid-Year Appraisal',
      mainEvaluator: appraisalList[0].mainEvaluator,
      otherEvaluators: appraisalList[0].otherEvaluators[0],
      startDate: appraisalList[0].fromDate,
      endDate: appraisalList[0].toDate,
    },
  });

  const startDate = methods.watch('startDate');
  const endDate = methods.watch('endDate');

  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      methods.setValue('endDate', startDate, { shouldValidate: true });
    }
  }, [startDate, endDate, methods.setValue]);
  return methods;
};

export default useAddMemberForm;
