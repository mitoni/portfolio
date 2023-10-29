import ProjectHero from "../../components/ProjectHero.astro";
import ProjectLayout from "../../layouts/ProjectLayout.astro";
import ColsLeft from "../../components/rows/ColsLeft.astro";
import { project } from "./inchioma.astro";

<Fragment>
<ProjectLayout>
<ProjectHero title={project.data.title} subtitle={project.data.subtitle} category={project.data.category} cover={project.data.cover} />

<ColsLeft>
<Video slot="col2" controls src="/assets/projects/mambo/mambo-video.mp4" />
</ColsLeft>
</ProjectLayout>

</Fragment>;

