import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as yup from 'yup';
import AssignResponsibility from './AssignResponsibility';
import GoalDetailsForm from './GoalDetailsForm';
import ProgressWeightForm from './ProgressWeightForm';

const Form = styled('form')``;

export const createNewGoalFormSchema = yup.object().shape({
  goalDetails: yup.object({
    name: yup.string().required('Goal name is required'),
    description: yup.string().required('Description is required'),
    startDate: yup.string().required('Start date is required'),
    dueDate: yup.string().required('Due date is required'),
    status: yup.mixed().required('Status is required'),
    priority: yup.string().required('Priority is required'),
  }),
  progressWeight: yup.object({
    completion: yup.number().required('Completion is required'),
    weight: yup.number().required('Weight is required'),
    addSubGoal: yup.boolean().required(''),
    subGoals: yup
      .array()
      .of(
        yup.object({
          goal: yup.string().required('Sub goal is required'),
        }),
      )
      .when('addSubGoal', {
        is: true,
        then: (schema) => schema.min(1, 'Sub goal is required'),
        otherwise: (schema) => schema.notRequired().nullable(),
      }),
  }),
  assignResponsibility: yup.object({
    mode: yup.mixed().required('Mode is required'),
    department: yup.string().required('Department is required'),
    team: yup.string().required('Team is required'),
    jobTitle: yup.string().required('Employee Job title is required'),
    additionalEmployee: yup.string(),
  }),
});

const CreateNewGoalForm = () => {
  const methods = useForm({
    resolver: yupResolver(createNewGoalFormSchema),
    defaultValues: {
      goalDetails: {
        startDate: '2025-06-01',
        dueDate: '2025-06-08',
        status: 'High',
        priority: 'High',
      },
      progressWeight: {
        completion: 30,
        weight: 10,
        addSubGoal: true,
        subGoals: [
          { goal: 'Design new UI mockups' },
          { goal: 'Develop frontend components' },
          { goal: 'Implement backend APIs' },
        ],
      },
      assignResponsibility: {
        mode: 'bulk',
      },
    },
  });

  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = (data) => {
    console.log('Create New Goal Form Data:', data);
    enqueueSnackbar('New goal created successfully!', { variant: 'success' });
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <Stack direction="column" gap={5} sx={{ mb: 5 }}>
          <GoalDetailsForm />
          <ProgressWeightForm />
          <AssignResponsibility />
        </Stack>
        <Stack justifyContent="flex-end" gap={1}>
          <Button variant="soft" color="neutral">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </Stack>
      </Form>
    </FormProvider>
  );
};

export default CreateNewGoalForm;
