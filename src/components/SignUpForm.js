import React from 'react';
import { Field, Label, Control, Input, Icon, Button } from 'bloomer';
import PropTypes from 'prop-types';
import useFormState from '../custom-hooks/useFormState';

const validate = values => {
  const errors = {};
  if (!values.name) errors.name = 'Name is required';
  if (!values.username) errors.username = 'Username is required';
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/(.+)@(.+){2,}\.(.+){2,}/.test(values.email)) {
    errors.email = 'Invalid email';
  }

  if (!values.password) errors.password = 'Password is required';

  if (values.password !== values.passwordConfirmation) {
    errors.passwordConfirmation = "Confirmation doesn't match the password";
  }
  return errors;
};

const SignUpForm = ({
  onSubmit,
  initialValues,
  loading,
  errors: submitErrors,
}) => {
  const [{ values, touched, errors }, { text, password }] = useFormState(
    initialValues,
    {
      validate,
    }
  );

  return (
    <form>
      <Field>
        <Label>Name</Label>
        <Control>
          <Input
            {...text('name')}
            isColor={touched.name && errors.name ? 'danger' : ''}
          />
        </Control>
        {touched.name && errors.name && (
          <p className="help is-danger">{errors.name}</p>
        )}
      </Field>

      <Field>
        <Label>Username</Label>
        <Control className="has-icons-left">
          <Input
            {...text('username')}
            isColor={touched.username && errors.username ? 'danger' : ''}
          />
          <Icon className="fa fa-user" isSize="small" isAlign="left" />
        </Control>
        {touched.username && errors.username && (
          <p className="help is-danger">{errors.username}</p>
        )}
      </Field>

      <Field>
        <Label>Email</Label>
        <Control className="has-icons-left">
          <Input
            {...text('email')}
            isColor={touched.email && errors.email ? 'danger' : ''}
          />
          <Icon className="fa fa-envelope" isSize="small" isAlign="left" />
        </Control>
        {touched.email && errors.email && (
          <p className="help is-danger">{errors.email}</p>
        )}
      </Field>

      <Field>
        <Label>Password</Label>
        <Control>
          <Input
            {...password('password')}
            isColor={touched.password && errors.password ? 'danger' : ''}
          />
        </Control>
        {touched.password && errors.password && (
          <p className="help is-danger">{errors.password}</p>
        )}
      </Field>

      <Field>
        <Label>Password confirmation</Label>
        <Control>
          <Input
            {...password('passwordConfirmation')}
            isColor={
              touched.passwordConfirmation && errors.passwordConfirmation
                ? 'danger'
                : ''
            }
          />
        </Control>
        {touched.passwordConfirmation && errors.passwordConfirmation && (
          <p className="help is-danger">{errors.passwordConfirmation}</p>
        )}
      </Field>

      {submitErrors && submitErrors.length > 0 && (
        <article className="message is-danger">
          <div className="message-body">
            <ul>
              {submitErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        </article>
      )}

      <Button
        isColor="primary"
        disabled={Object.keys(errors).length || loading}
        onClick={() => onSubmit(values)}
        isLoading={loading}
      >
        Submit
      </Button>
    </form>
  );
};

SignUpForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  errors: PropTypes.arrayOf(PropTypes.string),
};

export default SignUpForm;
