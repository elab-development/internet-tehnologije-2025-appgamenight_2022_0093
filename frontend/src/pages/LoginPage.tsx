import React, { useState } from 'react';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email je obavezan.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Unesite validan email.';
    }

    if (!formData.password) {
      newErrors.password = 'Lozinka je obavezna.';
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
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error: any) {
      setSubmitError(
        error.response?.data?.message || 'Doslo je do greske pri prijavi.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card title="Prijava">
            {submitError && (
              <Alert variant="danger" onClose={() => setSubmitError('')} dismissible>
                {submitError}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
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

              <Button
                type="submit"
                variant="primary"
                className="w-100 mt-3"
                loading={loading}
              >
                Prijavi se
              </Button>
            </Form>

            <hr />

            <p className="text-center text-muted mb-0">
              Nemate nalog?{' '}
              <Link to="/register">Registrujte se</Link>
            </p>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
