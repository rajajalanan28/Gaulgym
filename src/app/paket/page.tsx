export default function PackagesPage() {
  const packages = [
    {
      name: 'Basic',
      price: 29.99,
      period: 'month',
      features: ['Gym access', 'Locker room access', 'Free WiFi'],
      highlighted: false,
    },
    {
      name: 'Standard',
      price: 49.99,
      period: 'month',
      features: ['All Basic features', 'Group classes', 'Fitness assessment', 'Sauna access'],
      highlighted: true,
    },
    {
      name: 'Premium',
      price: 79.99,
      period: 'month',
      features: [
        'All Standard features',
        'Personal trainer (2 sessions/month)',
        'Nutrition plan',
        'Unlimited spa access',
        'Priority booking',
      ],
      highlighted: false,
    },
  ];

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#1a1a1a' }}>
        Membership Packages
      </h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '3rem' }}>
        Choose the perfect plan for your fitness goals
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {packages.map((pkg) => (
          <div
            key={pkg.name}
            style={{
              backgroundColor: pkg.highlighted ? '#2563eb' : '#ffffff',
              color: pkg.highlighted ? '#ffffff' : '#1a1a1a',
              borderRadius: '1rem',
              padding: '2rem',
              width: '320px',
              boxShadow: pkg.highlighted
                ? '0 20px 40px rgba(37, 99, 235, 0.3)'
                : '0 4px 20px rgba(0, 0, 0, 0.1)',
              border: pkg.highlighted ? 'none' : '1px solid #e5e5e5',
              transform: pkg.highlighted ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.2s ease',
            }}
          >
            {pkg.highlighted && (
              <div
                style={{
                  backgroundColor: '#fbbf24',
                  color: '#1a1a1a',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textAlign: 'center',
                  marginBottom: '1rem',
                  display: 'inline-block',
                }}
              >
                MOST POPULAR
              </div>
            )}

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {pkg.name}
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>${pkg.price}</span>
              <span style={{ opacity: 0.8 }}>/{pkg.period}</span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
              {pkg.features.map((feature) => (
                <li
                  key={feature}
                  style={{
                    padding: '0.5rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ color: pkg.highlighted ? '#ffffff' : '#2563eb' }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                backgroundColor: pkg.highlighted ? '#ffffff' : '#2563eb',
                color: pkg.highlighted ? '#2563eb' : '#ffffff',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Choose {pkg.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}