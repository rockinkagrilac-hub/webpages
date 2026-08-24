/**
 * Genera el hash bcrypt de una contraseña para el panel de administración.
 *
 *   node scripts/generar-hash.mjs "mi nueva contraseña"
 *
 * Imprime el hash y la sentencia SQL lista para pegar en el SQL Editor de
 * Supabase. La contraseña nunca sale de tu máquina: solo viaja el hash, del
 * que no se puede recuperar el original.
 */
import bcrypt from 'bcryptjs';

const password = process.argv[2];
const usuario = process.argv[3] || 'juadmin';

if (!password) {
  console.error('\nFalta la contraseña.\n');
  console.error('  Uso:  node scripts/generar-hash.mjs "tu-nueva-contrasena"');
  console.error('  Otro usuario:  node scripts/generar-hash.mjs "clave" otro_usuario\n');
  process.exit(1);
}

if (password.length < 8) {
  console.error('\nLa contraseña debe tener al menos 8 caracteres.\n');
  process.exit(1);
}

// Coste 12: el mismo que ya usa el hash guardado hoy.
const hash = bcrypt.hashSync(password, 12);

// Comprobación: el hash generado debe validar contra la contraseña original.
if (!bcrypt.compareSync(password, hash)) {
  console.error('\nError: el hash generado no valida. No lo uses.\n');
  process.exit(1);
}

console.log('\n  Hash generado y verificado:\n');
console.log('  ' + hash + '\n');
console.log('  Pega esto en Supabase -> SQL Editor -> Run:\n');
console.log("  update admin_users");
console.log("  set password_hash = '" + hash + "'");
console.log("  where username = '" + usuario + "';\n");
console.log('  Despues entra en /admin/login con:');
console.log('    usuario: ' + usuario);
console.log('    contrasena: la que acabas de escribir\n');
