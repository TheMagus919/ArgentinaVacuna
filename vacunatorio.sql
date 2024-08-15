-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-08-2024 a las 22:01:51
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `vacunatorio`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `MarcarVacunasVencidas` ()   BEGIN
    UPDATE LoteProveedor
    SET vencidas = '1'
    WHERE nroLote IN (
      SELECT nroLote
      FROM (
        SELECT LoteProveedor.nroLote
        FROM LoteProveedor
        WHERE LoteProveedor.fechaDeVencimiento < CURDATE()
      ) AS subquery
    );
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `agentedesalud`
--

CREATE TABLE `agentedesalud` (
  `dniAgente` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `apellido` varchar(255) NOT NULL,
  `fechaDeNacimiento` date NOT NULL,
  `genero` varchar(255) NOT NULL,
  `mail` varchar(255) NOT NULL,
  `pais` varchar(100) NOT NULL,
  `provincia` varchar(100) NOT NULL,
  `matricula` varchar(255) NOT NULL,
  `rol` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `agentedesalud`
--

INSERT INTO `agentedesalud` (`dniAgente`, `nombre`, `apellido`, `fechaDeNacimiento`, `genero`, `mail`, `pais`, `provincia`, `matricula`, `rol`, `password`) VALUES
(13214124, 'asd', 'asd', '1999-11-11', 'femenino', 'asd@gmail.com', 'Argentina', 'Buenos Aires', 'asd123', 'Deposito Centro Vacunacion', '$2b$10$2cZ.apIOaRFjQFjQe/4rjuCY3dId.e/3AQqhVlsotIq0MXGh0T5p2'),
(32564999, 'Juan', 'Ramon', '1970-02-15', 'masculino', 'juan@gmail.com', 'Argentina', 'San Luis', 'MA-34554', 'Medico', '$2b$10$8iz5EDGbFthk0r0cZfEOZ.Ao5FYnPKcSv6iqgAQUYVqd0PzF0ScAK'),
(37958141, 'Clara', 'Martinez', '1985-07-01', 'femenino', 'clara@gmail.com', 'Argentina', 'San Luis', 'MA-40535', 'Deposito Centro Vacunacion', '$2b$10$AdABPCRUYgEyWhBJSFs4VuQXTZUwk58k6srW6PiXjBbyWq7CfFetW'),
(39456584, 'Pepe', 'Manchado', '1975-12-05', 'masculino', 'pepe@gmail.com', 'Argentina', 'San Luis', 'DP-20347', 'Deposito Provincial', '$2b$10$NRlWAx5J7GMeL0WFzTOtWuXjjmu9BxlGHKOGNw0Rc6awbaQzsQOSC'),
(39998921, 'Jorge', 'Gonzalez', '1982-08-24', 'masculino', 'jorge@gmail.com', 'Argentina', 'Mendoza', 'CV-20954', 'Deposito Centro Vacunacion', '$2b$10$qw3KxEboNG/9/3GvoxlbmuhRDl2/9R/HWMF4FnsNiyO3yLUbo/mTG'),
(41222165, 'Marta', 'Moon', '1890-11-14', 'femenino', 'marta@gmail.com', 'España', 'Madrid', 'LA-24536', 'Laboratorio', '$2b$10$OTCoWmOKG9n0H0GzqQQ7refX9ROcn3xqptDpcohGdfoA584ss92RW'),
(41888451, 'Mario', 'Kempes', '1993-10-27', 'masculino', 'mario@gmail.com', 'Argentina', 'Mendoza', 'LAB-10359', 'Laboratorio', '$2b$10$NYQTnV8ezFYAMejTkXbJsuTdTTIqFM5DCcwklFHsnDb2hyyX.IE4q'),
(42146278, 'Carlos', 'Sosa', '1987-04-24', 'masculino', 'carlos@gmail.com', 'Argentina', 'San Luis', 'ADMIN', 'Administrador', '$2b$10$J2ugkJRPO2S9pjsdnE.Qce.k0RT8AEzqrAyHBcuGxpimQPyOvn5SW'),
(44556255, 'Mark', 'Smith', '2000-06-10', 'masculino', 'mark@gmail.com', 'Argentina', 'Mendoza', 'DP-10031', 'Deposito Provincial', '$2b$10$H3JPbGhJ1N19YVWip5O3Ceszt6YHxIiB3j/dA3143tDgThQKyrcHO'),
(45121222, 'Max', 'Rodriguez', '2004-07-28', 'femenino', 'max@gmail.com', 'Argentina', 'Mendoza', 'AS-19523', 'Medico', '$2b$10$xp5XyVv7ABtolj0OJCUI6Oi/q96Xt0xNh0CHiLFqu/SWgRKjBZ2tO'),
(47546555, 'Paola', 'Gomez', '1997-05-24', 'femenino', 'pao@gmail.com', 'Argentina', 'San Luis', 'MA-45658', 'Deposito Nacional', '$2b$10$z79uuOLhfZadnIDB5lhx9uU.2e..tx9t/vmYDNKT8SC3iYvFX4EdC'),
(48781152, 'Giuli', 'Giovanni', '2002-02-04', 'femenino', 'giuli@gmail.com', 'Argentina', 'Mendoza', 'DN-20342', 'Deposito Nacional', '$2b$10$ASnRJOWu271LEdaW94N7Q.Y8QOZiJ6zyJyFUR7kwEPXM/XMG2x1xG');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicacion`
--

CREATE TABLE `aplicacion` (
  `idAplicacion` int(11) NOT NULL,
  `dniPaciente` int(11) NOT NULL,
  `dniAgente` int(11) NOT NULL,
  `nroLote` int(11) NOT NULL,
  `fechaDeAplicacion` date NOT NULL,
  `idCentro` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `aplicacion`
--

INSERT INTO `aplicacion` (`idAplicacion`, `dniPaciente`, `dniAgente`, `nroLote`, `fechaDeAplicacion`, `idCentro`) VALUES
(1, 42278146, 32564999, 458454, '2024-06-25', 1),
(29, 47555241, 32564999, 564812, '2024-07-24', 1),
(30, 42278146, 32564999, 564812, '2024-07-28', 1),
(34, 42278146, 32564999, 875557, '2024-07-05', 1),
(36, 39787561, 45121222, 377734, '2024-07-26', 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `centrodevacunacion`
--

CREATE TABLE `centrodevacunacion` (
  `idCentro` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `provincia` varchar(255) NOT NULL,
  `localidad` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `centrodevacunacion`
--

INSERT INTO `centrodevacunacion` (`idCentro`, `nombre`, `provincia`, `localidad`, `direccion`) VALUES
(1, 'Centro Vacunatorio Carrillo', 'San Luis', 'Quines', 'Lujan 1032'),
(2, 'Centro De Vacunacion San Agustin', 'Buenos Aires', 'La Plata', 'Rio Bamba 1070'),
(3, 'Centro Rivadavia', 'San Luis', 'San Luis', 'Rivadavia 203'),
(4, 'Centro Bolivar', 'San Juan', 'San Juan', 'Buena Esperanza 504'),
(6, 'Centro Vacunatorio Cruz ', 'Mendoza', 'Viña', 'Av. fundador 1031');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `depositonacional`
--

CREATE TABLE `depositonacional` (
  `idDepNac` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `provincia` varchar(255) NOT NULL,
  `localidad` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `depositonacional`
--

INSERT INTO `depositonacional` (`idDepNac`, `nombre`, `provincia`, `localidad`, `direccion`) VALUES
(1, 'Depósito Nacional Buenos Aires', 'Buenos Aires', 'Mar del Plata', 'Av. Libertador 1234'),
(2, 'Depósito Nacional Córdoba', 'Córdoba', 'Córdoba', 'Av. Vélez Sarsfield 980'),
(3, 'Depósito Nacional Entre Ríos', 'Entre Ríos', 'Paraná', 'Calle Buenos Aires 567'),
(4, 'Depósito Nacional Tucumán', 'Tucumán', 'San Miguel de Tucumán', 'Av. Sarmiento 567'),
(5, 'Depósito Nacional Catamarca', 'Catamarca', 'San Fernando del Valle de Catamarca', 'Av. Virgen del Valle 567'),
(6, 'Depósito Nacional Chaco', 'Chaco', 'Resistencia', 'Av. 25 de Mayo 890'),
(7, 'Depósito Nacional Chubut', 'Chubut', 'Rawson', 'Av. Fontana 1122 '),
(8, 'Depósito Nacional Corrientes', 'Corrientes', 'Corrientes', 'Av. 3 de Abril 1025'),
(9, 'Depósito Nacional Formosa', 'Formosa', 'Formosa', 'Av. 25 de Mayo 200'),
(10, 'Depósito Nacional Jujuy', 'Jujuy', 'San Salvador de Jujuy', 'Av. Bolivia 300'),
(11, 'Depósito Nacional La Pampa', 'La Pampa', 'Santa Rosa', ' Calle Sarmiento 789'),
(12, 'Depósito Nacional La Rioja', 'La Rioja', 'La Rioja', 'Calle San Nicolás de Bari 567'),
(13, 'Depósito Nacional Misiones', 'Misiones', 'Posadas', 'Av. Uruguay 890'),
(14, 'Depósito Nacional Río Negro', 'Río Negro', 'Viedma', 'Av. Roca 1234 '),
(15, 'Depósito Nacional Salta', 'Salta', 'Salta', 'Av. Belgrano 456'),
(16, 'Depósito Nacional San Juan', 'San Juan', 'San Juan', 'Av. Libertador General San Martín 1234'),
(17, 'Depósito Nacional San Luis', 'San Luis', 'San Luis', 'Av. Illia 890'),
(18, 'Depósito Nacional Santa Cruz', 'Santa Cruz', 'Río Gallegos', 'Av. Kirchner 1234'),
(19, 'Depósito Nacional Santa Fe', 'Santa Fe', 'Santa Fe', 'Av. Rivadavia 567'),
(20, 'Depósito Nacional Santiago del Estero', 'Santiago del Estero', 'Santiago del Estero', 'Av. Belgrano 234'),
(21, 'Depósito Nacional Tierra del Fuego', 'Tierra del Fuego', 'Ushuaia', 'Av. San Martín 890'),
(22, 'Depósito Nacional Mendoza', 'Mendoza', 'Mendoza', 'Av. San Martín 1234'),
(23, 'Depósito Nacional Neuquén', 'Neuquén', 'Neuquén', 'Calle Leloir 345');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `depositoprovincial`
--

CREATE TABLE `depositoprovincial` (
  `idDepProv` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `provincia` varchar(255) NOT NULL,
  `localidad` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `depositoprovincial`
--

INSERT INTO `depositoprovincial` (`idDepProv`, `nombre`, `provincia`, `localidad`, `direccion`) VALUES
(1, 'Deposito Larga Vida', 'Córdoba', 'Mina Clavero', 'Pringles 420'),
(2, 'Deposito Provincial de Chubut', 'Chubut', 'Trelew', 'Avenida Fundador 1040'),
(3, 'Deposito SRL', 'San Luis', 'San Luis', 'Corrientes 204'),
(4, 'Deposito de la Provincia de Neuquén', 'Neuquén', 'Neuquén', 'Entre Lagos 1030'),
(5, 'Deposito Puntano', 'San Luis', 'La Toma', 'Av. Corrientes 305'),
(6, 'Deposito Provincial Las Viñas', 'Mendoza', 'Viña', 'Los Matorrales 2034');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `descarte`
--

CREATE TABLE `descarte` (
  `idDescarte` int(11) NOT NULL,
  `dniAgente` int(11) NOT NULL,
  `nroLote` int(11) NOT NULL,
  `cantidadDeVacunas` int(11) NOT NULL,
  `formaDescarte` varchar(255) NOT NULL,
  `empresaResponsable` varchar(255) NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `fechaDeDescarte` date NOT NULL,
  `idCentro` int(11) DEFAULT NULL,
  `idDepNac` int(11) DEFAULT NULL,
  `idDepProv` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `descarte`
--

INSERT INTO `descarte` (`idDescarte`, `dniAgente`, `nroLote`, `cantidadDeVacunas`, `formaDescarte`, `empresaResponsable`, `motivo`, `fechaDeDescarte`, `idCentro`, `idDepNac`, `idDepProv`) VALUES
(5, 37958141, 458454, 96, 'Incinerado', 'Cuidex', 'Perdida de Frio', '2024-07-26', 1, NULL, NULL),
(6, 47546555, 4343225, 25, 'Bolsa Roja Residuos Peligrosos', 'OSME', 'Perdida del Frio', '2024-08-01', NULL, 17, NULL),
(7, 39456584, 846555, 4, 'Incinerado', 'COVIDA', 'Frascos Rotos', '2024-08-01', NULL, NULL, 3),
(8, 39456584, 467824, 240, 'Bolsa roja', 'OSME', 'Perdida Frio', '2024-08-01', NULL, NULL, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `distribucioncentro`
--

CREATE TABLE `distribucioncentro` (
  `idDisCentro` int(11) NOT NULL,
  `nroLote` int(11) NOT NULL,
  `cantidadDeVacunas` int(11) NOT NULL,
  `idDepProv` int(11) NOT NULL,
  `fechaDeSalidaDepProv` date DEFAULT NULL,
  `idCentro` int(11) NOT NULL,
  `fechaLlegadaCentro` date DEFAULT NULL,
  `descartado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `distribucioncentro`
--

INSERT INTO `distribucioncentro` (`idDisCentro`, `nroLote`, `cantidadDeVacunas`, `idDepProv`, `fechaDeSalidaDepProv`, `idCentro`, `fechaLlegadaCentro`, `descartado`) VALUES
(3, 46782, 30, 1, '2024-05-16', 1, '2024-05-17', 0),
(7, 875557, 63, 2, '2024-06-30', 3, '2024-07-02', 0),
(8, 564811, 45, 3, '2024-06-03', 1, '2024-06-04', 0),
(9, 846555, 70, 3, '2024-06-25', 2, '2024-06-26', 0),
(10, 846555, 453, 4, '2024-06-23', 4, '2024-06-24', 0),
(11, 458454, 0, 3, '2024-06-20', 1, '2024-06-21', 1),
(12, 458454, 200, 3, '2024-06-20', 3, '2024-06-21', 0),
(13, 564812, 0, 5, '2024-07-13', 1, '2024-07-14', 0),
(14, 846555, 2, 3, '2024-07-04', 1, '2024-08-05', 0),
(16, 110254, 20, 5, '2024-08-06', 3, NULL, 0),
(17, 110254, 26, 5, NULL, 1, NULL, 0),
(18, 110254, 26, 5, NULL, 1, NULL, 0),
(19, 110254, 26, 5, NULL, 1, NULL, 0),
(20, 377734, 121, 6, '2024-07-22', 6, '2024-07-24', 0),
(22, 377734, 4, 6, NULL, 6, NULL, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `distribuciondeposito`
--

CREATE TABLE `distribuciondeposito` (
  `idDisDep` int(11) NOT NULL,
  `nroLote` int(11) NOT NULL,
  `cantidadDeVacunas` int(11) NOT NULL,
  `idDepNac` int(11) NOT NULL,
  `fechaDeSalidaDepNac` date DEFAULT NULL,
  `idDepProv` int(11) NOT NULL,
  `fechaLlegadaDepProv` date DEFAULT NULL,
  `descartado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `distribuciondeposito`
--

INSERT INTO `distribuciondeposito` (`idDisDep`, `nroLote`, `cantidadDeVacunas`, `idDepNac`, `fechaDeSalidaDepNac`, `idDepProv`, `fechaLlegadaDepProv`, `descartado`) VALUES
(2, 659568, 130, 2, '2023-06-27', 2, '2023-06-28', 0),
(5, 875557, 50, 2, '2024-06-27', 2, '2024-06-28', 0),
(6, 564811, 55, 4, '2024-05-31', 3, '2024-06-02', 0),
(7, 846555, 47, 3, '2024-06-20', 4, '2024-06-23', 0),
(9, 458454, 0, 3, '2024-06-17', 3, '2024-06-18', 0),
(10, 458454, 400, 3, '2024-06-17', 1, '2024-06-18', 0),
(11, 564812, 11, 17, '2024-07-11', 5, NULL, 0),
(12, 110254, 14, 17, '2024-08-04', 3, NULL, 0),
(17, 4343225, 50, 17, '2024-07-05', 3, '2024-07-07', 0),
(18, 110254, 60, 17, '2024-08-02', 5, '2024-08-03', 0),
(19, 4343225, 20, 17, '2024-07-04', 5, NULL, 0),
(21, 4343225, 25, 17, NULL, 5, NULL, 0),
(22, 846555, 0, 17, '2024-07-01', 3, '2024-07-03', 1),
(23, 110254, 120, 17, '2024-08-04', 5, '2024-08-05', 0),
(24, 979925, 35, 17, NULL, 3, NULL, 0),
(25, 377734, 74, 22, '2024-07-20', 6, '2024-07-21', 0),
(26, 377734, 146, 22, NULL, 6, NULL, 0),
(27, 467824, 0, 17, '2024-08-04', 5, '2024-08-06', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `laboratorio`
--

CREATE TABLE `laboratorio` (
  `idLab` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `pais` varchar(255) NOT NULL,
  `provincia` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telefono` bigint(20) NOT NULL,
  `direccion` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `laboratorio`
--

INSERT INTO `laboratorio` (`idLab`, `nombre`, `pais`, `provincia`, `email`, `telefono`, `direccion`) VALUES
(1, 'Laboratorio Zennit', 'Argentina', 'Mendoza', 'zennitlab@salud.com.ar', 2655484855, 'Los molles 405'),
(2, 'Laboratorio Cisco', 'Estados Unidos', 'Nueva York', 'labcisco@salud.usa', 6555481522, 'East Beach 203'),
(3, 'Laboratorio Madrid', 'España', 'Madrid', 'laabmadridista@salud.esp', 5465552999, 'La española 378'),
(4, 'Laboratorio Medellín', 'Colombia', 'Medellín', 'labmedellin@lab.co', 2456848444, 'Lima 2035');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `loteproveedor`
--

CREATE TABLE `loteproveedor` (
  `nroLote` int(11) NOT NULL,
  `idLab` int(11) NOT NULL,
  `idTipoVacuna` int(11) NOT NULL,
  `tipoDeFrasco` varchar(255) NOT NULL,
  `nombreComercial` varchar(255) NOT NULL,
  `cantidadDeVacunas` int(11) NOT NULL,
  `fechaDeFabricacion` date NOT NULL,
  `fechaDeVencimiento` date NOT NULL,
  `vencidas` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `loteproveedor`
--

INSERT INTO `loteproveedor` (`nroLote`, `idLab`, `idTipoVacuna`, `tipoDeFrasco`, `nombreComercial`, `cantidadDeVacunas`, `fechaDeFabricacion`, `fechaDeVencimiento`, `vencidas`) VALUES
(46782, 1, 1, 'Monodosis', 'Fizzer', 70, '2024-05-01', '2024-05-31', 1),
(110254, 1, 7, 'Multidosis', 'varivax', 1500, '2024-07-01', '2024-10-01', 0),
(124671, 3, 3, 'Monodosis', 'Chiringuito', 50, '2024-06-01', '2024-06-30', 1),
(377734, 1, 5, 'Monodosis', 'Hepoxi', 2400, '2024-07-15', '2024-09-15', 0),
(458454, 3, 5, 'Multidosis', 'Vacunex', 700, '2024-06-01', '2024-08-01', 0),
(467824, 1, 2, 'Multidosis', 'Fizzerr', 400, '2024-07-28', '2024-08-31', 0),
(564811, 1, 2, 'Multidosis', 'Copernico', 230, '2024-05-01', '2024-06-23', 1),
(564812, 2, 7, 'Multidosis', 'Transeneca', 50, '2024-04-26', '2024-09-12', 0),
(659568, 3, 3, 'Multidosis', 'Elixir', 144, '2023-06-01', '2023-06-30', 1),
(846555, 4, 5, 'Multidosis', 'Medeyi', 740, '2024-06-01', '2024-08-30', 0),
(875557, 3, 3, 'Monodosis', 'Cipron', 400, '2024-06-01', '2024-08-31', 0),
(979925, 1, 6, 'Multidosis', 'Polimorf', 750, '2024-07-01', '2024-08-31', 0),
(4343224, 2, 4, 'Monodosis', 'Pronx', 223, '2024-05-01', '2024-06-25', 1),
(4343225, 1, 4, 'Monodosis', 'Meningo', 100, '2024-07-01', '2024-10-31', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paciente`
--

CREATE TABLE `paciente` (
  `dniPaciente` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `apellido` varchar(255) NOT NULL,
  `fechaDeNacimiento` date NOT NULL,
  `genero` varchar(255) NOT NULL,
  `mail` varchar(255) NOT NULL,
  `provincia` varchar(255) NOT NULL,
  `localidad` varchar(255) NOT NULL,
  `celular` bigint(20) NOT NULL,
  `celularDeRespaldo` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `paciente`
--

INSERT INTO `paciente` (`dniPaciente`, `nombre`, `apellido`, `fechaDeNacimiento`, `genero`, `mail`, `provincia`, `localidad`, `celular`, `celularDeRespaldo`) VALUES
(39787561, 'Julio', 'Gomez', '1987-12-12', 'masculino', 'julio@gmail.com', 'Mendoza', 'Chacras de Coria', 2669587812, 0),
(42278146, 'Agustin', 'Barroso', '1999-12-11', 'masculino', 'ag@gmail.com', 'San Luis', 'Lujan', 2664033945, 0),
(45655544, 'Pedro', 'Lopez', '1978-05-15', 'masculino', 'pedro@gmail.com', 'Cordoba', 'Cura Brochero', 2666459881, 2666559966),
(47555241, 'Carla', 'Fernandez', '2004-06-26', 'femenino', 'carla@gmail.com', 'San Luis', 'Lujan', 2664778777, 2665889121),
(56888444, 'Sofia', 'Ochoa', '2014-06-10', 'femenino', 'sof@gmail.com', 'San Luis', 'La Toma', 2666489748, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipovacuna`
--

CREATE TABLE `tipovacuna` (
  `idTipoVacuna` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipovacuna`
--

INSERT INTO `tipovacuna` (`idTipoVacuna`, `nombre`) VALUES
(3, 'Antitetánica'),
(2, 'Doble Viral'),
(1, 'Triple Viral'),
(4, 'Vacuna contra el meningococo'),
(5, 'Vacuna contra la hepatitis B'),
(6, 'Vacuna contra la poliomielitis'),
(7, 'Vacuna contra la varicela');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `trabaja`
--

CREATE TABLE `trabaja` (
  `idTrabaja` int(11) NOT NULL,
  `dniAgente` int(11) NOT NULL,
  `idCentro` int(11) DEFAULT NULL,
  `idDepProv` int(11) DEFAULT NULL,
  `idLab` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `trabaja`
--

INSERT INTO `trabaja` (`idTrabaja`, `dniAgente`, `idCentro`, `idDepProv`, `idLab`) VALUES
(1, 13214124, 2, NULL, NULL),
(2, 39456584, NULL, 3, NULL),
(3, 37958141, 1, NULL, NULL),
(4, 39456584, NULL, 5, NULL),
(6, 32564999, 1, NULL, NULL),
(7, 41888451, NULL, NULL, 1),
(9, 41222165, NULL, NULL, 3),
(10, 44556255, NULL, 6, NULL),
(11, 39998921, 6, NULL, NULL),
(12, 45121222, 6, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `traslado`
--

CREATE TABLE `traslado` (
  `idTraslado` int(11) NOT NULL,
  `cantidadDeVacunas` int(11) NOT NULL,
  `nroLote` int(11) NOT NULL,
  `fechaSalida` date DEFAULT NULL,
  `fechaLlegada` date DEFAULT NULL,
  `idCentroEnvia` int(11) NOT NULL,
  `idCentroRecibe` int(11) NOT NULL,
  `descartado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `traslado`
--

INSERT INTO `traslado` (`idTraslado`, `cantidadDeVacunas`, `nroLote`, `fechaSalida`, `fechaLlegada`, `idCentroEnvia`, `idCentroRecibe`, `descartado`) VALUES
(15, 21, 875557, '2024-07-02', '2024-07-04', 3, 1, 0),
(16, 1, 458454, '2024-06-22', '2024-06-24', 1, 3, 0),
(17, 2, 458454, '2024-06-23', NULL, 1, 3, 0),
(18, 2, 110254, '2024-07-11', NULL, 1, 2, 0),
(19, 2, 564812, '2024-07-17', '2024-07-19', 3, 1, 0),
(20, 15, 875557, NULL, NULL, 3, 1, 0),
(21, 20, 564812, NULL, NULL, 1, 3, 0),
(22, 10, 564812, NULL, NULL, 1, 1, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `trasladodeposito`
--

CREATE TABLE `trasladodeposito` (
  `idTrasladoDep` int(11) NOT NULL,
  `nroLote` int(11) NOT NULL,
  `cantidadDeVacunas` int(11) NOT NULL,
  `idDepNac` int(11) NOT NULL,
  `fechaDeCompra` date NOT NULL,
  `fechaDeAdquisicion` date DEFAULT NULL,
  `descartado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `trasladodeposito`
--

INSERT INTO `trasladodeposito` (`idTrasladoDep`, `nroLote`, `cantidadDeVacunas`, `idDepNac`, `fechaDeCompra`, `fechaDeAdquisicion`, `descartado`) VALUES
(1, 46782, 40, 1, '2024-05-15', '2024-05-15', 0),
(8, 875557, 250, 2, '2024-06-25', '2024-06-26', 0),
(9, 564811, 130, 4, '2024-05-28', '2024-05-30', 0),
(10, 846555, 120, 3, '2024-06-15', '2024-06-18', 0),
(11, 564812, 50, 1, '2024-05-27', '2024-05-29', 0),
(12, 458454, 0, 3, '2024-06-13', '2024-06-15', 0),
(13, 110254, 1346, 17, '2024-07-05', '2024-07-06', 0),
(14, 564812, 20, 17, '2024-07-01', '2024-07-02', 0),
(15, 4343225, 0, 17, '2024-07-02', '2024-07-03', 1),
(16, 979925, 715, 17, '2024-07-02', '2024-07-03', 0),
(17, 377734, 2050, 22, '2024-07-17', '2024-07-19', 0),
(18, 467824, 160, 17, '2024-07-31', '2024-08-02', 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `agentedesalud`
--
ALTER TABLE `agentedesalud`
  ADD PRIMARY KEY (`dniAgente`),
  ADD UNIQUE KEY `mail` (`mail`),
  ADD UNIQUE KEY `matricula` (`matricula`);

--
-- Indices de la tabla `aplicacion`
--
ALTER TABLE `aplicacion`
  ADD PRIMARY KEY (`idAplicacion`),
  ADD KEY `nroLote` (`nroLote`),
  ADD KEY `idCentro` (`idCentro`),
  ADD KEY `aplicacion_dniPaciente_idCentro_unique` (`dniPaciente`,`idCentro`) USING BTREE,
  ADD KEY `aplicacion_idCentro_dniAgente_unique` (`dniAgente`) USING BTREE;

--
-- Indices de la tabla `centrodevacunacion`
--
ALTER TABLE `centrodevacunacion`
  ADD PRIMARY KEY (`idCentro`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `depositonacional`
--
ALTER TABLE `depositonacional`
  ADD PRIMARY KEY (`idDepNac`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD UNIQUE KEY `provincia` (`provincia`);

--
-- Indices de la tabla `depositoprovincial`
--
ALTER TABLE `depositoprovincial`
  ADD PRIMARY KEY (`idDepProv`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `descarte`
--
ALTER TABLE `descarte`
  ADD PRIMARY KEY (`idDescarte`),
  ADD KEY `dniAgente` (`dniAgente`),
  ADD KEY `nroLote` (`nroLote`),
  ADD KEY `idCentro` (`idCentro`),
  ADD KEY `idDepNac` (`idDepNac`),
  ADD KEY `idDepProv` (`idDepProv`);

--
-- Indices de la tabla `distribucioncentro`
--
ALTER TABLE `distribucioncentro`
  ADD PRIMARY KEY (`idDisCentro`),
  ADD KEY `idCentro` (`idCentro`),
  ADD KEY `distribucionCentro_nroLote_idCentro_unique` (`nroLote`,`idCentro`) USING BTREE,
  ADD KEY `distribucionCentro_idDepProv_idCentro_unique` (`idDepProv`) USING BTREE;

--
-- Indices de la tabla `distribuciondeposito`
--
ALTER TABLE `distribuciondeposito`
  ADD PRIMARY KEY (`idDisDep`),
  ADD KEY `idDepProv` (`idDepProv`),
  ADD KEY `distribucionDeposito_nroLote_idDepProv_unique` (`nroLote`,`idDepProv`) USING BTREE,
  ADD KEY `distribucionDeposito_idDepProv_idDepNac_unique` (`idDepNac`) USING BTREE;

--
-- Indices de la tabla `laboratorio`
--
ALTER TABLE `laboratorio`
  ADD PRIMARY KEY (`idLab`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `loteproveedor`
--
ALTER TABLE `loteproveedor`
  ADD PRIMARY KEY (`nroLote`),
  ADD UNIQUE KEY `nombreComercial` (`nombreComercial`),
  ADD KEY `idLab` (`idLab`),
  ADD KEY `idTipoVacuna` (`idTipoVacuna`);

--
-- Indices de la tabla `paciente`
--
ALTER TABLE `paciente`
  ADD PRIMARY KEY (`dniPaciente`),
  ADD UNIQUE KEY `mail` (`mail`);

--
-- Indices de la tabla `tipovacuna`
--
ALTER TABLE `tipovacuna`
  ADD PRIMARY KEY (`idTipoVacuna`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `trabaja`
--
ALTER TABLE `trabaja`
  ADD PRIMARY KEY (`idTrabaja`),
  ADD UNIQUE KEY `centroUnico` (`dniAgente`,`idCentro`),
  ADD UNIQUE KEY `depoUnico` (`dniAgente`,`idDepProv`),
  ADD UNIQUE KEY `labUnico` (`dniAgente`,`idLab`),
  ADD KEY `dniAgente` (`dniAgente`),
  ADD KEY `idCentro` (`idCentro`),
  ADD KEY `idDepProv` (`idDepProv`),
  ADD KEY `idLab` (`idLab`);

--
-- Indices de la tabla `traslado`
--
ALTER TABLE `traslado`
  ADD PRIMARY KEY (`idTraslado`),
  ADD KEY `nroLote` (`nroLote`),
  ADD KEY `idCentroEnvia` (`idCentroEnvia`),
  ADD KEY `idCentroRecibe` (`idCentroRecibe`);

--
-- Indices de la tabla `trasladodeposito`
--
ALTER TABLE `trasladodeposito`
  ADD PRIMARY KEY (`idTrasladoDep`),
  ADD UNIQUE KEY `trasladoDeposito_nroLote_idDepNac_unique` (`nroLote`,`idDepNac`),
  ADD KEY `idDepNac` (`idDepNac`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `aplicacion`
--
ALTER TABLE `aplicacion`
  MODIFY `idAplicacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de la tabla `centrodevacunacion`
--
ALTER TABLE `centrodevacunacion`
  MODIFY `idCentro` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `depositonacional`
--
ALTER TABLE `depositonacional`
  MODIFY `idDepNac` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `depositoprovincial`
--
ALTER TABLE `depositoprovincial`
  MODIFY `idDepProv` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `descarte`
--
ALTER TABLE `descarte`
  MODIFY `idDescarte` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `distribucioncentro`
--
ALTER TABLE `distribucioncentro`
  MODIFY `idDisCentro` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `distribuciondeposito`
--
ALTER TABLE `distribuciondeposito`
  MODIFY `idDisDep` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `laboratorio`
--
ALTER TABLE `laboratorio`
  MODIFY `idLab` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `loteproveedor`
--
ALTER TABLE `loteproveedor`
  MODIFY `nroLote` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4343226;

--
-- AUTO_INCREMENT de la tabla `tipovacuna`
--
ALTER TABLE `tipovacuna`
  MODIFY `idTipoVacuna` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `trabaja`
--
ALTER TABLE `trabaja`
  MODIFY `idTrabaja` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `traslado`
--
ALTER TABLE `traslado`
  MODIFY `idTraslado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `trasladodeposito`
--
ALTER TABLE `trasladodeposito`
  MODIFY `idTrasladoDep` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `aplicacion`
--
ALTER TABLE `aplicacion`
  ADD CONSTRAINT `aplicacion_ibfk_1` FOREIGN KEY (`dniPaciente`) REFERENCES `paciente` (`dniPaciente`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `aplicacion_ibfk_2` FOREIGN KEY (`dniAgente`) REFERENCES `agentedesalud` (`dniAgente`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `aplicacion_ibfk_3` FOREIGN KEY (`nroLote`) REFERENCES `loteproveedor` (`nroLote`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `aplicacion_ibfk_4` FOREIGN KEY (`idCentro`) REFERENCES `centrodevacunacion` (`idCentro`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `descarte`
--
ALTER TABLE `descarte`
  ADD CONSTRAINT `descarte_ibfk_1` FOREIGN KEY (`dniAgente`) REFERENCES `agentedesalud` (`dniAgente`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `descarte_ibfk_2` FOREIGN KEY (`nroLote`) REFERENCES `loteproveedor` (`nroLote`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `distribucioncentro`
--
ALTER TABLE `distribucioncentro`
  ADD CONSTRAINT `distribucioncentro_ibfk_1` FOREIGN KEY (`nroLote`) REFERENCES `loteproveedor` (`nroLote`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `distribucioncentro_ibfk_2` FOREIGN KEY (`idDepProv`) REFERENCES `depositoprovincial` (`idDepProv`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `distribucioncentro_ibfk_3` FOREIGN KEY (`idCentro`) REFERENCES `centrodevacunacion` (`idCentro`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `distribuciondeposito`
--
ALTER TABLE `distribuciondeposito`
  ADD CONSTRAINT `distribuciondeposito_ibfk_1` FOREIGN KEY (`nroLote`) REFERENCES `loteproveedor` (`nroLote`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `distribuciondeposito_ibfk_2` FOREIGN KEY (`idDepNac`) REFERENCES `depositonacional` (`idDepNac`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `distribuciondeposito_ibfk_3` FOREIGN KEY (`idDepProv`) REFERENCES `depositoprovincial` (`idDepProv`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `loteproveedor`
--
ALTER TABLE `loteproveedor`
  ADD CONSTRAINT `loteproveedor_ibfk_1` FOREIGN KEY (`idLab`) REFERENCES `laboratorio` (`idLab`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `loteproveedor_ibfk_2` FOREIGN KEY (`idTipoVacuna`) REFERENCES `tipovacuna` (`idTipoVacuna`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `trabaja`
--
ALTER TABLE `trabaja`
  ADD CONSTRAINT `trabaja_ibfk_1` FOREIGN KEY (`dniAgente`) REFERENCES `agentedesalud` (`dniAgente`),
  ADD CONSTRAINT `trabaja_ibfk_2` FOREIGN KEY (`idCentro`) REFERENCES `centrodevacunacion` (`idCentro`),
  ADD CONSTRAINT `trabaja_ibfk_3` FOREIGN KEY (`idDepProv`) REFERENCES `depositoprovincial` (`idDepProv`);

--
-- Filtros para la tabla `traslado`
--
ALTER TABLE `traslado`
  ADD CONSTRAINT `traslado_ibfk_1` FOREIGN KEY (`nroLote`) REFERENCES `loteproveedor` (`nroLote`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `traslado_ibfk_2` FOREIGN KEY (`idCentroEnvia`) REFERENCES `centrodevacunacion` (`idCentro`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `traslado_ibfk_3` FOREIGN KEY (`idCentroRecibe`) REFERENCES `centrodevacunacion` (`idCentro`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `trasladodeposito`
--
ALTER TABLE `trasladodeposito`
  ADD CONSTRAINT `trasladodeposito_ibfk_1` FOREIGN KEY (`nroLote`) REFERENCES `loteproveedor` (`nroLote`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trasladodeposito_ibfk_2` FOREIGN KEY (`idDepNac`) REFERENCES `depositonacional` (`idDepNac`) ON DELETE CASCADE ON UPDATE CASCADE;

DELIMITER $$
--
-- Eventos
--
CREATE DEFINER=`root`@`localhost` EVENT `MarcarVacunasVencidasDiariamente` ON SCHEDULE EVERY 1 DAY STARTS '2024-06-09 04:48:02' ON COMPLETION NOT PRESERVE ENABLE DO CALL MarcarVacunasVencidas()$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
