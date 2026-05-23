'use client';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { addressSchema } from './steps/Address';
import { jobInformationSchema } from './steps/JobInformation';
import { personalInformationSchema } from './steps/PersonalInformation';

const newMemberFormSchema = [personalInformationSchema, jobInformationSchema, addressSchema];

function useNewMemberForm(activeStep) {
  return useForm({
    resolver: newMemberFormSchema[activeStep]
      ? yupResolver(newMemberFormSchema[activeStep])
      : undefined,
    defaultValues: {
      permanent: {
        country: '',
        state: '',
        city: '',
        street: '',
        zip: '',
      },
      present: {
        country: '',
        state: '',
        city: '',
        street: '',
        zip: '',
      },
      isSameAddress: false,
    },
  });
}

export default useNewMemberForm;
