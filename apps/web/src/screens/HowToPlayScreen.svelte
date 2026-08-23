<script lang="ts">
  let { onBack }: { onBack: () => void } = $props();
</script>

<main class="screen">
  <div class="howto">
    <h1 class="brand" style="font-size: 42px;">Cómo jugar</h1>
    <p class="tagline">La Mosca · variante Las Parejas. Entrá cuando quieras; esto no es un tutorial obligatorio.</p>
    <article>
      <h2>Objetivo</h2>
      <p>
        Todos empiezan con 20. El primero en llegar a 0 o menos gana. Ganar una baza resta 1. Quedar chupado suma 5.
        Saltar el palito suma 50.
      </p>
    </article>
    <article>
      <h2>Los palos</h2>
      <p>Oros, copas, espadas y bastos. El triunfo lo marca la carta revelada junto al mazo, a la derecha de quien reparte.</p>
    </article>
    <article>
      <h2>Jerarquía</h2>
      <p class="rank-line">1 &gt; 3 &gt; 12 (Rey) &gt; 11 (Caballo) &gt; 10 (Sota) &gt; 9 … &gt; 2</p>
      <p>Un triunfo gana a cualquier carta que no sea triunfo. El 1 es el más fuerte de su palo; el 2, el más débil.</p>
    </article>
    <article>
      <h2>Pasar y cambiar</h2>
      <p>
        Si el triunfo no es 1 ni 2, podés pasar (salvo el dealer) o cambiar hasta 3. Con 1 nadie pasa y se puede cambiar.
        Con 2 nadie pasa ni cambia. El dealer no cambia la carta revelada.
      </p>
    </article>
    <article>
      <h2>Seguir palo y superar</h2>
      <p>
        Hay que asistir al palo de salida y, si se puede, superar. Sin palo, hay que triunfar si se puede. El palo de
        salida —la primera carta de la baza— aparece a la izquierda del triunfo y cambia en cada vuelta. Todavía podés
        jugar otra carta: eso es palito.
      </p>
    </article>
    <article>
      <h2>Palito</h2>
      <p>
        Jugar una carta ilegal no está bloqueado. Se anuncia palito y sumás +50 al toque, sin modal. La carta queda en la
        baza.
      </p>
    </article>
    <article>
      <h2>Mosca y chupado</h2>
      <p>
        Mosca es 1, 3, 12, 11 y 10 de triunfo: vale −5 y cierra la mano. Quien juega y no gana ninguna baza queda chupado
        (+5). Si alguien llega a 0, la partida termina ahí.
      </p>
    </article>
    <button class="btn btn-primary" type="button" onclick={onBack}>Volver</button>
  </div>
</main>
