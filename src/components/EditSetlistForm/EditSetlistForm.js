import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Field, Control, Label, TextArea } from 'bloomer';
import ItemsList from './ItemsList';
import validateSetlist from './validateSetlist';

const EditSetlistForm = ({ initialValues, onSubmit, onPreview, loading }) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  useEffect(() => setValues(initialValues), [initialValues]);

  const handleClick = action => () => {
    const { comment, items } = values;
    const newErrors = validateSetlist({ comment, items });
    setErrors(newErrors);
    if (!Object.keys(newErrors).length) {
      action(values);
    }
  };

  const updateItems = useCallback(
    setItems =>
      setValues(_values => ({
        ..._values,
        items: setItems(_values.items),
      })),
    []
  );

  return (
    <form>
      <ItemsList
        items={values.items}
        onChange={updateItems}
        defaultValues={initialValues.items}
        artistId={parseInt(initialValues.artist.id)}
        errors={errors.items}
      />

      <Field>
        <Label>Edit comment</Label>
        <Control>
          <TextArea
            onChange={event =>
              setValues({ ...values, comment: event.target.value })
            }
          />
        </Control>
      </Field>

      <div className="buttons">
        <Button
          isColor="primary"
          disabled={loading}
          onClick={handleClick(onSubmit)}
        >
          Submit
        </Button>

        <Button isColor="secondary" onClick={handleClick(onPreview)}>
          Preview
        </Button>
      </div>
    </form>
  );
};

EditSetlistForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onPreview: PropTypes.func,
  loading: PropTypes.bool,
};

export default EditSetlistForm;
