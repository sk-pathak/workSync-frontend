import { useState, useEffect } from "react";

const Spinner = () => {
  const [rotation, setRotation] = useState(0);

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    const rotationValue = scrollPosition * 0.5;
    setRotation(rotationValue);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div style={styles.container} className="w-2/5">
      <img
        src='../src/assets/sync-2.png'
        alt='Spinning'
        style={{
          ...styles.image,
          transform: `rotate(${rotation}deg)`,
        }}
      />
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  image: {
    width: "200px",
    height: "200px",
    transition: "transform 0.1s ease-out",
  },
};

export default Spinner;
