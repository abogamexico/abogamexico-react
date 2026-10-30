// Correos que ven el enlace al panel de administración.
// (El servidor vuelve a revisar con ADMIN_EMAILS; esto solo muestra u oculta el enlace.)
export const ADMIN_EMAILS = ['abogamexicoconsultoria@gmail.com', 'osalcidooo@gmail.com']
export const esAdmin = user => !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())
