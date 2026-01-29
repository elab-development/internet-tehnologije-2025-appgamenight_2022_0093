import React, { useState } from 'react';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username) {
      newErrors.username = 'Korisnicko ime je obavezno.';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Korisnicko ime mora imati najmanje 3 karaktera.';
    }

    if (!formData.email) {
      newErrors.email = 'Email je obavezan.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Unesite validan email.';
    }

    if (!formData.password) {
      newErrors.password = 'Lozinka je obavezna.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Lozinka mora imati najmanje 6 karaktera.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Potvrdite lozinku.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Lozinke se ne poklapaju.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/');
    } catch (error: any) {
      setSubmitError(
        error.response?.data?.message || 'Doslo je do greske pri registraciji.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card title="Registracija">
            {submitError && (
              <Alert variant="danger" onClose={() => setSubmitError('')} dismissible>
                {submitError}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <InputField
                label="Korisnicko ime"
                type="text"
                name="username"
                value={formData.username}
                placeholder="vase_ime"
                error={errors.username}
                required
                onChange={handleChange}
              />

              <InputField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                placeholder="vas@email.com"
                error={errors.email}
                required
                onChange={handleChange}
              />

              <InputField
                label="Lozinka"
                type="password"
                name="password"
                value={formData.password}
                placeholder="Unesite lozinku"
                error={errors.password}
                required
                onChange={handleChange}
              />

              <InputField
                label="Potvrdite lozinku"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                placeholder="Ponovite lozinku"
                error={errors.confirmPassword}
                required
                onChange={handleChange}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-100 mt-3"
                loading={loading}
              >
                Registruj se
              </Button>
            </Form>

            <hr />

            <p className="text-center text-muted mb-0">
              Vec imate nalog?{' '}
              <Link to="/login">Prijavite se</Link>
            </p>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
