import { useState } from 'react';
import useNumberFormat from 'hooks/useNumberFormat';

const useAddPayHandlers = (params, field, apiRef) => {
  const { currencyFormat } = useNumberFormat();
  const [newLabel, setNewLabel] = useState(field === 'extraPay' ? 'Bonus' : '');
  const [newAmount, setNewAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => setIsAdding(true);

  const handleCancel = () => {
    setNewLabel(field === 'extraPay' ? 'Bonus' : '');
    setNewAmount('');
    setIsAdding(false);
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();

    if (e.key === 'Enter') {
      e.preventDefault();
      if (!newLabel.trim() || !newAmount.trim()) return;

      apiRef.current?.updateRows([
        {
          id: params.row.id,
          [field]: [
            ...params.row[field],
            {
              label: newLabel,
              amount: Number(newAmount),
            },
          ],
        },
      ]);

      handleCancel();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return {
    currencyFormat,
    newLabel,
    setNewLabel,
    newAmount,
    setNewAmount,
    isAdding,
    handleAdd,
    handleCancel,
    handleKeyDown,
  };
};

export default useAddPayHandlers;
