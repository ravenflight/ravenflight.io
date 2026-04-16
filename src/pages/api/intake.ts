import { type APIRoute } from 'astro';

interface IntakeFormData {
  name: string;
  email: string;
  company: string;
  industry: string;
  services: string[];
  timeline: string;
  context: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sendEmail = async (data: IntakeFormData): Promise<boolean> => {
  // This would normally integrate with an email service
  // For now, we'll log to console and use a simple approach
  try {
    const emailContent = `
New RavenFlight Lead Intake:

Name: ${data.name}
Email: ${data.email}
Company: ${data.company}
Industry: ${data.industry}
Services Interested In: ${data.services.join(', ') || 'Not specified'}
Timeline: ${data.timeline}

Context:
${data.context}

---
Timestamp: ${new Date().toISOString()}
`;

    console.log('Intake form submission:', emailContent);
    return true;
  } catch (error) {
    console.error('Error processing intake form:', error);
    return false;
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await request.formData();

    // Collect services (checkboxes)
    const services: string[] = [];
    const servicesArray = formData.getAll('services');
    if (servicesArray && servicesArray.length > 0) {
      services.push(...(servicesArray as string[]));
    }

    const data: IntakeFormData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
      industry: formData.get('industry') as string,
      services,
      timeline: formData.get('timeline') as string,
      context: formData.get('context') as string,
    };

    // Validation
    if (!data.name || !data.email || !data.company || !data.industry) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!validateEmail(data.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Process the intake form
    const success = await sendEmail(data);

    if (!success) {
      return new Response(
        JSON.stringify({ error: 'Failed to process submission' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Thanks for reaching out! We\'ll review your information and get back to you soon.' 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Intake API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
