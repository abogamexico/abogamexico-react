import { useEffect } from 'react'
import Navbar from '../components/Navbar'

// ── Datos del responsable (editar aquí si cambian) ─────────────────
const RESPONSABLE = 'Rafael Orlando Salcido Hernández'
const DOMICILIO = 'Calle Ing. Jesús Robles número 19, Colonia Jorge Jiménez Cantú, C.P. 52167, Metepec, Estado de México, México'
const CORREO = 'abogamexicoconsultoria@gmail.com'
const SITIO = 'abogamexico.com'
const ACTUALIZADO = '16 de octubre de 2026'

function LegalLayout({ title, children }) {
  useEffect(() => { window.scrollTo(0, 0); document.title = title + ' — AbogaMéxico' }, [title])
  return (
    <div style={{ background: 'var(--gris)', minHeight: '100vh' }}>
      <Navbar scrolled />
      <main className="legal" style={{ maxWidth: 820, margin: '0 auto', padding: '120px 20px 80px' }}>
        <article style={{ background: '#fff', borderRadius: 16, padding: 'clamp(24px,5vw,56px)', boxShadow: 'var(--sh)' }}>
          <h1 style={{ color: 'var(--azul)', fontSize: 'clamp(1.7rem,4vw,2.3rem)', marginBottom: 8 }}>{title}</h1>
          <p style={{ fontSize: '.85rem', color: '#777', marginBottom: 8 }}>Última actualización: {ACTUALIZADO}</p>
          {children}
        </article>
        <p style={{ textAlign: 'center', marginTop: 28 }}><a href="/" style={{ color: 'var(--azul)', fontWeight: 600 }}>← Volver al inicio</a></p>
      </main>
    </div>
  )
}

export function Privacidad() {
  return (
    <LegalLayout title="Aviso de privacidad integral">
      <h2>1. Identidad y domicilio del responsable</h2>
      <p>{RESPONSABLE}, persona física con actividad empresarial que opera la plataforma AbogaMéxico ({SITIO}), con domicilio en {DOMICILIO}, es responsable del tratamiento de tus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares. Para cualquier asunto relacionado con este aviso puedes escribir a <a href={'mailto:' + CORREO}>{CORREO}</a>.</p>

      <h2>2. Datos personales que recabamos</h2>
      <p><strong>Si eres cliente:</strong></p>
      <ul>
        <li>Identificación y contacto: nombre, apellido, correo electrónico, teléfono, país y ciudad de residencia.</li>
        <li>Datos de tu consulta: especialidad legal, fecha y hora elegidas y la descripción que nos des de tu asunto.</li>
        <li>Datos de pago: el cobro lo procesa Stripe. AbogaMéxico no recibe ni guarda el número completo de tu tarjeta; solo conservamos el identificador de la transacción, el monto y su estado.</li>
      </ul>
      <p><strong>Si eres abogado:</strong> nombre, apellido, correo, teléfono, número de cédula profesional, especialidad, entidad y ciudad donde ejerces, y descripción profesional. Tu número de cédula se usa solo para verificar tu registro y no se publica en el sitio.</p>
      <p><strong>Datos sensibles.</strong> La descripción de un asunto legal puede revelar información sensible (por ejemplo, sobre tu situación familiar, migratoria, penal o de salud). Solo la tratamos para atender tu consulta, con tu consentimiento expreso, que nos das al aceptar este aviso al registrarte y al agendar. Te pedimos compartir únicamente lo necesario para que el abogado te oriente.</p>

      <h2>3. Para qué usamos tus datos</h2>
      <p><strong>Finalidades necesarias para darte el servicio:</strong></p>
      <ul>
        <li>Crear y administrar tu cuenta.</li>
        <li>Agendar tu consulta, cobrarla y emitir los comprobantes que correspondan.</li>
        <li>Asignarte un abogado y compartirle los datos de tu consulta para que pueda atenderte.</li>
        <li>Crear la videollamada y enviarte por correo la confirmación y el enlace.</li>
        <li>Atender dudas, aclaraciones, cambios de horario y reembolsos.</li>
        <li>Verificar la cédula profesional de los abogados que se registran.</li>
        <li>Cumplir obligaciones legales y fiscales.</li>
      </ul>
      <p><strong>Finalidades adicionales (no son necesarias para el servicio):</strong> enviarte encuestas de satisfacción, novedades y promociones de AbogaMéxico. Si no quieres que usemos tus datos para esto, escríbenos a <a href={'mailto:' + CORREO}>{CORREO}</a> con el asunto «No publicidad»; negarte no afecta el servicio que contrataste.</p>

      <h2>4. Con quién compartimos tus datos</h2>
      <ul>
        <li><strong>El abogado asignado a tu consulta</strong>, que es un profesional independiente, para que pueda darte la asesoría que contrataste.</li>
        <li><strong>Proveedores que nos ayudan a operar la plataforma</strong> y tratan los datos solo por nuestra cuenta: Stripe (procesamiento de pagos), Supabase (base de datos y cuentas de usuario), Vercel (alojamiento del sitio) y Google (calendario, videollamadas por Google Meet y correo). Algunos de estos proveedores almacenan información en servidores fuera de México, principalmente en Estados Unidos.</li>
        <li><strong>Autoridades</strong>, únicamente cuando una ley o una orden judicial nos obligue.</li>
      </ul>
      <p>No vendemos ni rentamos tus datos personales.</p>

      <h2>5. Tus derechos ARCO</h2>
      <p>Tienes derecho a <strong>Acceder</strong> a tus datos, <strong>Rectificarlos</strong> si son inexactos, <strong>Cancelarlos</strong> cuando consideres que no se necesitan y <strong>Oponerte</strong> a su uso para fines específicos. También puedes revocar tu consentimiento o limitar el uso de tus datos.</p>
      <p>Para ejercerlos, envía un correo a <a href={'mailto:' + CORREO}>{CORREO}</a> con:</p>
      <ul>
        <li>Tu nombre completo y el correo con el que te registraste.</li>
        <li>Una copia de una identificación oficial (o, si actúa un representante, el documento que lo acredite).</li>
        <li>Qué derecho quieres ejercer y sobre qué datos.</li>
      </ul>
      <p>Te responderemos en un plazo máximo de 20 días hábiles y, si procede, haremos efectiva tu solicitud dentro de los 15 días hábiles siguientes. Ten en cuenta que algunos datos debemos conservarlos por obligaciones legales o fiscales.</p>

      <h2>6. Cookies y almacenamiento en tu navegador</h2>
      <p>El sitio guarda en tu navegador únicamente lo necesario para mantener tu sesión iniciada y recordar tu idioma. Hoy no usamos cookies de publicidad ni de rastreo. Si en el futuro agregamos herramientas de medición, actualizaremos este aviso.</p>

      <h2>7. Cambios a este aviso</h2>
      <p>Cualquier cambio a este aviso de privacidad se publicará en esta misma página ({SITIO}/privacidad), indicando la fecha de la última actualización.</p>

      <h2>8. Autoridad</h2>
      <p>Si consideras que tu derecho a la protección de datos personales ha sido vulnerado, puedes acudir ante la autoridad competente en la materia, actualmente la Secretaría Anticorrupción y Buen Gobierno.</p>
    </LegalLayout>
  )
}

export function Terminos() {
  return (
    <LegalLayout title="Términos y condiciones">
      <h2>1. Quiénes somos</h2>
      <p>AbogaMéxico ({SITIO}) es una plataforma operada por {RESPONSABLE}, con domicilio en {DOMICILIO}, que conecta a personas que necesitan orientación legal sobre asuntos en México con abogados mexicanos independientes que cuentan con cédula profesional. Al crear una cuenta o agendar una consulta aceptas estos términos y nuestro <a href="/privacidad">Aviso de privacidad</a>.</p>

      <h2>2. Naturaleza del servicio</h2>
      <ul>
        <li>Los abogados de la red son profesionales independientes y son responsables de la asesoría que dan. AbogaMéxico verifica su cédula profesional antes de activarlos, pero no dicta el contenido de su opinión jurídica.</li>
        <li>La consulta es una <strong>orientación legal por videollamada</strong> de hasta 60 minutos. No incluye representación ante autoridades, redacción de documentos ni seguimiento del caso. Si tu asunto requiere esos servicios, el abogado te explicará los siguientes pasos y su costo, y cualquier acuerdo adicional será directamente entre tú y el abogado.</li>
        <li>La plataforma no es adecuada para emergencias. Si tienes un plazo legal por vencer o estás detenido, busca atención inmediata.</li>
      </ul>

      <h2>3. Cuenta</h2>
      <p>Debes ser mayor de edad y dar información verdadera. Eres responsable de cuidar tu contraseña y de lo que se haga con tu cuenta.</p>

      <h2>4. Precio y pago</h2>
      <ul>
        <li>Cada consulta cuesta <strong>$49.99 USD</strong> (dólares estadounidenses) más los impuestos aplicables, que se muestran desglosados antes de que confirmes el pago.</li>
        <li>El pago se hace por adelantado con tarjeta de crédito o débito a través de Stripe. Tu banco podría aplicar comisiones por conversión de moneda o por compras internacionales; esas comisiones no dependen de AbogaMéxico.</li>
        <li>La consulta queda confirmada cuando el pago es aprobado. Recibirás la confirmación y el enlace de la videollamada en tu correo.</li>
      </ul>

      <h2>5. Cambios de horario y cancelaciones</h2>
      <ul>
        <li>Puedes cambiar el horario de tu consulta sin costo hasta 24 horas antes de la cita, escribiendo a <a href={'mailto:' + CORREO}>{CORREO}</a>.</li>
        <li>Las consultas pagadas no son reembolsables. Si no puedes asistir, te ofrecemos el cambio de horario dentro del plazo anterior.</li>
        <li>Si no te conectas en los primeros 15 minutos de la cita sin haber pedido el cambio con 24 horas de anticipación, la consulta se considera dada.</li>
        <li>Si el abogado no se presenta o la consulta no puede darse por fallas de la plataforma, la reprogramamos sin costo. Si no fuera posible darte el servicio, te devolvemos lo que pagaste, como lo establece la Ley Federal de Protección al Consumidor.</li>
      </ul>

      <h2>6. Uso correcto</h2>
      <p>No está permitido usar la plataforma para fines ilícitos, suplantar a otra persona, grabar la videollamada sin el consentimiento del abogado ni contactar a los abogados para evadir el pago a través de la plataforma.</p>

      <h2>7. Responsabilidad</h2>
      <p>AbogaMéxico pone los medios para que la consulta se realice, pero no garantiza un resultado en tu asunto legal. La responsabilidad de AbogaMéxico frente a ti se limita, en todo caso, al monto que pagaste por la consulta de que se trate.</p>

      <h2>8. Propiedad intelectual</h2>
      <p>La marca AbogaMéxico, el logotipo, el diseño y los contenidos del sitio pertenecen a su titular y no pueden usarse sin autorización.</p>

      <h2>9. Cambios a estos términos</h2>
      <p>Podemos actualizar estos términos. La versión vigente siempre estará en {SITIO}/terminos, y aplicará a las consultas que se agenden después de su publicación.</p>

      <h2>10. Ley aplicable y quejas</h2>
      <p>Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia, las partes se someten a los tribunales competentes del Estado de México. Como consumidor, también puedes acudir a la Procuraduría Federal del Consumidor (PROFECO).</p>
    </LegalLayout>
  )
}
