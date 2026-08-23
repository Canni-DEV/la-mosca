<script lang="ts">
  let { onBack }: { onBack: () => void } = $props();
</script>

<main class="screen">
  <div class="howto">
    <h1 class="brand" style="font-size: 42px;">Cómo jugar</h1>
    <article>
      <h2>Objetivo</h2>
      <p>
        Todos empiezan con 20 puntos. El primero en llegar a 0 o menos gana. Ganar vueltas resta 1; quedar
        chupado suma 5; saltar el palito suma 50.
      </p>
    </article>
    <article>
      <h2>Triunfo</h2>
      <p>
        Se reparte a la derecha. La quinta carta del que reparte se da vuelta y marca el palo de triunfo. Un
        triunfo gana a cualquier carta que no sea triunfo.
      </p>
    </article>
    <article>
      <h2>Jerarquía</h2>
      <p>Dentro de un palo la fuerza es 1, 3, 12, 11, 10 y después el resto hasta el 2, que es el más débil.</p>
    </article>
    <article>
      <h2>Pasar y cambiar</h2>
      <p>
        Si el triunfo no es 1 ni 2, podés pasar (salvo el que reparte) o cambiar hasta 3 cartas. Con 1 nadie
        pasa y se puede cambiar. Con 2 nadie pasa ni cambia. El que reparte no puede cambiar la carta revelada.
      </p>
    </article>
    <article>
      <h2>Seguir palo y superar</h2>
      <p>
        Hay que asistir al palo de salida y, si se puede, superar. Si no tenés palo, hay que triunfar si se
        puede, y superar un triunfo si se puede. Todavía podés jugar otra carta: eso es saltar el palito y suma
        +50 al toque, sin modal de confirmación.
      </p>
    </article>
    <article>
      <h2>Mosca y chupado</h2>
      <p>
        Mosca es tener 1, 3, 12, 11 y 10 de triunfo: vale -5 y termina la mano. Quien juega y no gana ninguna
        vuelta queda chupado (+5). Si alguien llega a 0, la partida termina ahí.
      </p>
    </article>
    <button class="btn btn-primary" type="button" onclick={onBack}>Volver</button>
  </div>
</main>
