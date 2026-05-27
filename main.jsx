import React from 'react'
import { createRoot } from 'react-dom/client'
import { Save, MessageCircle, FileText, RefreshCcw, Search, User, Laptop, CheckCircle, AlertTriangle, List, Pencil, Camera, PenLine, Trash2, CalendarDays, UsersRound } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import AuthGate from './components/AuthGate.jsx'
import { buscarOCrearCliente, crearEquipo, crearRecepcion, generarFolio, listarRecepciones, actualizarCliente, actualizarEquipo, actualizarRecepcion, subirFotoRecepcion, registrarFotoRecepcion, subirFirmaRecepcion, registrarFirmaRecepcion, listarFotosRecepcion, listarFirmaRecepcion, eliminarRecepcion } from './supabase.js'
import './styles.css'

const LOGO_DATA_URL = '/publiclogo-the-clinic.jpg'
const BUSINESS={phone:'833 105 52 66',phoneRaw:'8331055266',address:'Calle República de Cuba #400 Sur, Col. Ricardo Flores Magón, Cd. Madero, Tamaulipas',technician:'I.S.C. Sergio V. Ramirez Garnica',legal:`1. El cliente autoriza la recepción del equipo descrito para revisión, diagnóstico, mantenimiento o reparación.
2. Cuando el equipo presente falla electrónica y requiera diagnóstico técnico especializado, aplican estos costos de revisión: PC o Laptop Home/Office $400 MXN; equipo Gamer o alto rendimiento $600 MXN; equipo Apple $900 MXN.
3. Si el equipo está funcionando y solo se solicita revisión general por lentitud, configuración, sistema o validación preventiva, la revisión no tendrá costo, salvo que el cliente autorice algún servicio adicional.
4. Algunas fallas electrónicas no pueden detectarse a simple vista. En ciertos casos se requiere prueba, desmontaje, cambio temporal de piezas o validación progresiva para confirmar la falla. Una pieza nueva también puede presentar defecto o incompatibilidad detectable únicamente al instalarla y probarla.
5. El cliente es responsable de proporcionar datos correctos de contacto y de contar con respaldo previo de su información. Durante procesos técnicos puede existir riesgo de pérdida parcial o total de datos.
6. No nos hacemos responsables por daños previos, equipos manipulados anteriormente, corrosión, daño por líquidos, golpes, malware, piezas previamente defectuosas, contraseñas no proporcionadas o fallas no visibles antes del diagnóstico.
7. Ninguna reparación con costo será realizada sin autorización del cliente.
8. Una vez notificado que el equipo está listo para entrega, diagnóstico o seguimiento, el cliente contará con 30 días naturales para recogerlo. Después de ese plazo podrán generarse cargos por resguardo y almacenamiento. Si el equipo permanece abandonado sin respuesta ni comunicación, el establecimiento podrá tomar acciones para recuperación de costos operativos, almacenamiento y servicio conforme a la legislación aplicable.
9. La firma del cliente confirma que ha leído y acepta estos términos y condiciones.`}
const initialForm={cliente:'',telefono:'',correo:'',tipo:'Laptop',marca:'',modelo:'',password_pin:'',accesorios:'',estado_fisico:'',falla_reportada:'',estado:'Recibido'}
const RECEPTION_DRAFT_KEY='theclinic_recepcion_form_draft_v1';
function getInitialReceptionForm(){try{const raw=window.localStorage?.getItem(RECEPTION_DRAFT_KEY);if(raw){const saved=JSON.parse(raw);return {...initialForm,...saved}}}catch(e){}return initialForm}
function saveReceptionDraft(data){try{window.localStorage?.setItem(RECEPTION_DRAFT_KEY,JSON.stringify(data))}catch(e){}}
function clearReceptionDraft(){try{window.localStorage?.removeItem(RECEPTION_DRAFT_KEY)}catch(e){}}
function normalizePhone(phone){
  let digits=String(phone||'').replace(/\D/g,'');
  if(digits.length===10) return `52${digits}`;
  if(digits.length===12 && digits.startsWith('52')) return digits;
  if(digits.length>12 && digits.startsWith('521')) return `52${digits.slice(3)}`;
  return digits;
}
function App(){return <div>ERROR: archivo truncado accidentalmente</div>}
createRoot(document.getElementById('root')).render(
  <AuthGate>
    <App/>
  </AuthGate>
)
