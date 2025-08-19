import ejemploChart from '../img/ejemplo_chart.png';  // Importar imagen a usarse

const PercentagesPage = () => {
  return (
    <div
      title="Recetas en las que se gana más"
      style={{
        backgroundImage: `url(${ejemploChart})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: '2rem',
        fontWeight: 'bold',
        textShadow: '1px 1px 4px rgba(0,0,0,0.7)'
      }}
    >
      
    </div>
  );
};

export default PercentagesPage;
