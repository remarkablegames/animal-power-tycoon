import Phaser from 'phaser';
import { render } from 'phaser-jsx';

import { TilemapDebug, Typewriter } from '../components';
import {
  Depth,
  key,
  TilemapLayer,
  TilemapObject,
  TILESET_NAME,
} from '../constants';
import { TileMarker } from '../graphics';
import { Player, Spaceman } from '../sprites';
import { state } from '../state';

interface Sign extends Phaser.Physics.Arcade.StaticBody {
  text?: string;
}

export class Main extends Phaser.Scene {
  private player!: Player;
  private sign!: Sign;
  private spacemanGroup!: Phaser.GameObjects.Group;
  private tileMarker!: TileMarker;
  private tilemap!: Phaser.Tilemaps.Tilemap;
  private worldLayer!: Phaser.Tilemaps.TilemapLayer;

  constructor() {
    super(key.scene.main);
  }

  create() {
    this.tilemap = this.make.tilemap({ key: key.tilemap.tuxemon });
    const tileset = this.tilemap.addTilesetImage(
      TILESET_NAME,
      key.image.tuxemon,
    )!;

    this.tilemap.createLayer(TilemapLayer.BelowPlayer, tileset);
    const worldLayer = this.tilemap.createLayer(TilemapLayer.World, tileset)!;
    const aboveLayer = this.tilemap.createLayer(
      TilemapLayer.AbovePlayer,
      tileset,
      0,
      0,
    )!;

    worldLayer.setCollisionByProperty({ collides: true });
    this.physics.world.bounds.width = worldLayer.width;
    this.physics.world.bounds.height = worldLayer.height;

    aboveLayer.setDepth(Depth.AbovePlayer);

    const spawnPoint = this.tilemap.findObject(
      TilemapLayer.Objects,
      ({ name }) => name === TilemapObject.SpawnPoint,
    )!;

    const sign = this.tilemap.findObject(
      TilemapLayer.Objects,
      ({ name }) => name === TilemapObject.Sign,
    )!;

    this.sign = this.physics.add.staticBody(
      sign.x!,
      sign.y!,
      sign.width,
      sign.height,
    );
    this.sign.text = sign.properties[0].value;

    this.player = new Player(this, spawnPoint.x!, spawnPoint.y!);
    this.addPlayerSignInteraction();
    this.physics.add.collider(this.player, worldLayer);

    this.cameras.main.setBounds(
      0,
      0,
      this.tilemap.widthInPixels,
      this.tilemap.heightInPixels,
    );

    render(<TilemapDebug tilemapLayer={worldLayer} />, this);

    this.tileMarker = new TileMarker(this, this.tilemap, worldLayer!);

    this.addSpaceman(worldLayer);

    state.isTypewriting = true;
    render(
      <Typewriter
        text="WASD or arrow keys to move."
        onEnd={() => (state.isTypewriting = false)}
      />,
      this,
    );

    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.pause(key.scene.main);
      this.scene.launch(key.scene.menu);
    });
  }

  private addSpaceman(worldLayer: Phaser.Tilemaps.TilemapLayer) {
    this.spacemanGroup = this.add.group();

    Array.from(Array(10).keys()).forEach(() => {
      this.spacemanGroup.add(
        new Spaceman(
          this,
          Phaser.Math.RND.between(0, worldLayer.width - 1),
          Phaser.Math.RND.between(0, worldLayer.height - 1),
        ),
      );
    });

    this.physics.add.collider(this.spacemanGroup, worldLayer);
    this.physics.add.collider(this.spacemanGroup, this.player);
    this.physics.add.collider(this.spacemanGroup, this.spacemanGroup);
  }

  private addPlayerSignInteraction() {
    type ArcadeColliderType = Phaser.Types.Physics.Arcade.ArcadeColliderType;

    this.physics.add.overlap(
      this.sign as unknown as ArcadeColliderType,
      this.player.selector as unknown as ArcadeColliderType,
      (sign) => {
        if (this.player.cursors.space.isDown && !state.isTypewriting) {
          state.isTypewriting = true;

          render(
            <Typewriter
              text={(sign as unknown as Sign).text!}
              onEnd={() => (state.isTypewriting = false)}
            />,
            this,
          );
        }
      },

      undefined,
      this,
    );
  }

  update() {
    this.player.update();
    this.tileMarker.update();
    this.spacemanGroup.getChildren().forEach((spaceman) => spaceman.update());
  }
}
