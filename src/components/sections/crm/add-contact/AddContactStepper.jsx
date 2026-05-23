'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, Container, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { createClient } from 'lib/supabase/client';
import CompanyInfoForm, {
  companyInfoSchema,
} from 'components/sections/crm/add-contact/steps/CompanyInfoForm';
import LeadInfoForm, {
  leadInfoSchema,
} from 'components/sections/crm/add-contact/steps/LeadInfoForm';
import PersonalInfoForm, {
  personalInfoSchema,
} from 'components/sections/crm/add-contact/steps/PersonalInfoForm';

const steps = [
  {
    id: 1,
    label: (
      <Typography variant="subtitle2" fontWeight={700}>
        Personal Info
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          rmation
        </Box>
      </Typography>
    ),
    content: <PersonalInfoForm label="Personal Information" />,
  },
  {
    id: 2,
    label: (
      <Typography
        variant="subtitle2"
        fontWeight={700}
        sx={{
          '& br': { display: { xs: 'none', sm: 'inline' } },
        }}
      >
        Company Info
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          rmation
        </Box>
      </Typography>
    ),
    content: <CompanyInfoForm label="Company Information" />,
  },
  {
    id: 3,
    label: (
      <Typography
        variant="subtitle2"
        fontWeight={700}
        sx={{
          '& br': { display: { xs: 'none', sm: 'inline' } },
        }}
      >
        Lead Info
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          rmation
        </Box>
      </Typography>
    ),
    content: <LeadInfoForm label="Lead Information" />,
  },
];

const validationSchema = personalInfoSchema.concat(companyInfoSchema).concat(leadInfoSchema);

const AddContactStepper = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      personalInfo: {
        country: 'US',
        tags: [],
      },
      companyInfo: {
        country: 'US',
      },
      leadInfo: {
        status: '',
        priority: '',
      },
    },
  });

  const { getValues, reset } = methods;

  const handleNext = async () => {
    const stepKey = ['personalInfo', 'companyInfo', 'leadInfo'][activeStep];
    const isValid = await methods.trigger(stepKey);
    if (isValid) {
      setCompletedSteps((prev) => ({ ...prev, [activeStep]: true }));
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      enqueueSnackbar('You need to be logged in to add a contact.', { variant: 'error' });
      setIsSaving(false);
      return;
    }

    try {
      const companyId = await saveCompany(supabase, user.id, data.companyInfo);
      const contact = await saveContact(supabase, user.id, companyId, data.personalInfo);
      await saveLead(supabase, user.id, companyId, contact.id, data.leadInfo);

      enqueueSnackbar('Contact added successfully', { variant: 'success' });
      reset();
      setCompletedSteps({});
      setActiveStep(0);
    } catch (error) {
      enqueueSnackbar(error.message || 'Could not add contact.', { variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };
  const handleStepClick = (step) => {
    setActiveStep(step);
  };

  const handleSaveContact = async () => {
    const isValid = await methods.trigger('personalInfo');

    if (!isValid) {
      setActiveStep(0);
      return;
    }

    await onSubmit(getValues());
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleNext();
  };

  return (
    <FormProvider {...methods}>
      <Container maxWidth="sm" sx={{ p: 0 }}>
        <Stepper nonLinear activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.map(({ id, label }, index) => (
            <Step key={id} completed={!!completedSteps[index]} sx={{ p: 0 }}>
              <StepLabel onClick={() => handleStepClick(index)} sx={{ cursor: 'pointer' }}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box component="form" onSubmit={handleFormSubmit}>
          <Box sx={{ mb: 7 }}>{steps[activeStep]?.content}</Box>

          <Stack gap={2} justifyContent="flex-end">
            {activeStep > 0 && (
              <Button
                variant="soft"
                color="neutral"
                onClick={handleBack}
                sx={{ px: 4 }}
                disabled={isSaving}
              >
                Back
              </Button>
            )}

            <Button
              type="button"
              variant="contained"
              sx={{ px: 4 }}
              loading={isSaving}
              onClick={handleSaveContact}
            >
              Save Contact
            </Button>

            {activeStep < steps.length - 1 && (
              <Button type="submit" variant="soft" disabled={isSaving}>
                Continue to {activeStep === 0 ? 'Company' : 'Lead'}
              </Button>
            )}
          </Stack>
        </Box>
      </Container>
    </FormProvider>
  );
};

function cleanText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

async function saveCompany(supabase, ownerId, companyInfo) {
  if (!cleanText(companyInfo?.name)) {
    return null;
  }

  const payload = {
    owner_id: ownerId,
    name: cleanText(companyInfo.name),
    company_type: cleanText(companyInfo.companyType),
    website: cleanText(companyInfo.website),
    phone: cleanText(companyInfo.phone),
    email: cleanText(companyInfo.email),
    address_line1: cleanText(companyInfo.addressLine1),
    address_line2: cleanText(companyInfo.addressLine2),
    city: cleanText(companyInfo.city),
    region: cleanText(companyInfo.region),
    postal_code: cleanText(companyInfo.postalCode),
    country: cleanText(companyInfo.country) || 'US',
    notes: cleanText(companyInfo.notes),
  };

  const { data, error } = await supabase
    .from('companies')
    .upsert(payload, { onConflict: 'owner_id,name' })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function saveContact(supabase, ownerId, companyId, personalInfo) {
  const { data, error } = await supabase
    .from('contacts')
    .insert({
      owner_id: ownerId,
      company_id: companyId,
      first_name: cleanText(personalInfo.firstName),
      last_name: cleanText(personalInfo.lastName),
      title: cleanText(personalInfo.title),
      email: cleanText(personalInfo.email),
      phone: cleanText(personalInfo.phone),
      mobile_phone: cleanText(personalInfo.mobilePhone),
      address_line1: cleanText(personalInfo.addressLine1),
      address_line2: cleanText(personalInfo.addressLine2),
      city: cleanText(personalInfo.city),
      region: cleanText(personalInfo.region),
      postal_code: cleanText(personalInfo.postalCode),
      country: cleanText(personalInfo.country) || 'US',
      tags: personalInfo.tags || [],
      notes: cleanText(personalInfo.notes),
    })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function saveLead(supabase, ownerId, companyId, contactId, leadInfo) {
  const shouldCreateLead = Boolean(
    cleanText(leadInfo?.source) ||
      cleanText(leadInfo?.status) ||
      leadInfo?.priority ||
      leadInfo?.estimatedBudget ||
      leadInfo?.targetPurchaseDate ||
      leadInfo?.lastContactedAt ||
      leadInfo?.nextFollowUpAt ||
      cleanText(leadInfo?.notes)
  );

  if (!shouldCreateLead) {
    return null;
  }

  const { error } = await supabase.from('leads').insert({
    owner_id: ownerId,
    contact_id: contactId,
    company_id: companyId,
    source: cleanText(leadInfo.source),
    status: cleanText(leadInfo.status) || 'new',
    priority: Number(leadInfo.priority) || 3,
    estimated_budget: leadInfo.estimatedBudget || null,
    target_purchase_date: leadInfo.targetPurchaseDate || null,
    last_contacted_at: leadInfo.lastContactedAt || null,
    next_follow_up_at: leadInfo.nextFollowUpAt || null,
    notes: cleanText(leadInfo.notes),
  });

  if (error) {
    throw error;
  }

  return true;
}

export default AddContactStepper;
