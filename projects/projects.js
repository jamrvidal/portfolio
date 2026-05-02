import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

if (projectsContainer && projects) {
    renderProjects(projects, projectsContainer, 'h2');

    const titleElement = document.querySelector('.projects-title');
    if (titleElement) {
        titleElement.textContent = `${projects.length} Projects`;
    }
}

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let query = ''
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);
let selectedIndex = -1;
let data = []

function renderPieChart(projectsGiven) {
  d3.select('#projects-pie-plot').selectAll('path').remove();
  d3.select('.legend').selectAll('li').remove();

  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));
  

  arcs.forEach((arc, idx) => {
  d3.select('#projects-pie-plot')
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(idx))
    .on('click', function() {
      selectedIndex = selectedIndex === idx ? -1 : idx;

      d3.select('#projects-pie-plot')
        .selectAll('path')
        .attr('class', (_, i) => i === selectedIndex ? 'selected' : '');

      d3.select('.legend')
        .selectAll('li')
        .attr('class', (_, i) => i === selectedIndex ? 'legend-item selected' : 'legend-item');

      
      if (selectedIndex === -1) {
        renderProjects(projects, projectsContainer, 'h2');
      } else {
        let selectedYear = data[selectedIndex].label;
        let filteredProjects = projects.filter((p) => p.year === selectedYear);
        renderProjects(filteredProjects, projectsContainer, 'h2');
      }
    });
});

  let legend = d3.select('.legend');
  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

renderPieChart(projects);

let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});